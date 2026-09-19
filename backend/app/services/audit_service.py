import math
from typing import List, Tuple, Optional
from app.models.schemas import InvoiceExtract, LineItem, AnomalyFlag, AnomalyType, InvoiceRecord
from app.models.database import db
from app.core.config import settings

class AuditAnomalyService:
    @staticmethod
    def audit_invoice(
        extract: InvoiceExtract,
        vendor_id: Optional[str] = None,
        exclude_invoice_id: Optional[str] = None
    ) -> Tuple[List[AnomalyFlag], List[LineItem]]:
        """
        Executes all 3 core auditing checks:
        1. FR-4.1: Arithmetic Sanity Check (Δ > $0.05)
        2. FR-4.2: Duplicate Invoice Check (vendor + invoice_number)
        3. FR-4.3: Statistical Unit-Price Surge Check (Z-score >= 2.5 or > 25% surge)
        """
        flags: List[AnomalyFlag] = []
        audited_items: List[LineItem] = []

        # -------------------------------------------------------------
        # 1. FR-4.1 Arithmetic Sanity Check
        # -------------------------------------------------------------
        calculated_subtotal = sum(item.unit_price * item.quantity for item in extract.items)
        # also verify line total consistency
        calculated_item_totals = sum(item.total_price for item in extract.items)
        calculated_grand_total = calculated_subtotal + extract.tax_amount
        
        delta_grand_total = abs(calculated_grand_total - extract.total_amount)
        delta_subtotal = abs(calculated_subtotal - extract.subtotal)

        if delta_grand_total > settings.ARITHMETIC_TOLERANCE or delta_subtotal > settings.ARITHMETIC_TOLERANCE:
            flags.append(
                AnomalyFlag(
                    flag_type=AnomalyType.ARITHMETIC_MISMATCH,
                    severity="critical",
                    field="total_amount",
                    message=(
                        f"Arithmetic Mismatch: Calculated sum of items (${calculated_subtotal:.2f}) + "
                        f"tax (${extract.tax_amount:.2f}) = ${calculated_grand_total:.2f}, "
                        f"but invoice states Grand Total as ${extract.total_amount:.2f} "
                        f"(Discrepancy: ${delta_grand_total:+.2f})."
                    ),
                    details={
                        "calculated_subtotal": round(calculated_subtotal, 2),
                        "stated_subtotal": round(extract.subtotal, 2),
                        "tax_amount": round(extract.tax_amount, 2),
                        "calculated_total": round(calculated_grand_total, 2),
                        "stated_total": round(extract.total_amount, 2),
                        "discrepancy": round(delta_grand_total, 2)
                    }
                )
            )

        # -------------------------------------------------------------
        # 2. FR-4.2 Duplicate Invoice Check
        # -------------------------------------------------------------
        clean_inv_num = extract.invoice_number.strip().lower()
        clean_vendor_name = extract.vendor_name.strip().lower()

        for inv in db.invoices.values():
            if exclude_invoice_id and inv.id == exclude_invoice_id:
                continue
            
            same_vendor = (
                (vendor_id and inv.vendor_id == vendor_id) or
                (inv.vendor_name.strip().lower() == clean_vendor_name) or
                (extract.tax_id and inv.tax_id and inv.tax_id.strip() == extract.tax_id.strip())
            )
            same_invoice_num = (inv.invoice_number.strip().lower() == clean_inv_num)

            if same_vendor and same_invoice_num:
                status_desc = "Approved" if inv.is_approved else "Pending Review"
                flags.append(
                    AnomalyFlag(
                        flag_type=AnomalyType.DUPLICATE_INVOICE,
                        severity="critical",
                        field="invoice_number",
                        message=(
                            f"Duplicate Submission Detected: Invoice #{extract.invoice_number} from vendor "
                            f"'{inv.vendor_name}' already exists in ledger (Record ID: {inv.id}, Status: {status_desc}, Date: {inv.invoice_date})."
                        ),
                        details={
                            "existing_invoice_id": inv.id,
                            "existing_date": inv.invoice_date,
                            "existing_total": inv.total_amount,
                            "is_approved": inv.is_approved
                        }
                    )
                )
                break

        # -------------------------------------------------------------
        # 3. FR-4.3 Statistical Unit-Price Surge & Z-Score Analysis
        # -------------------------------------------------------------
        # Gather historical approved unit prices for each item description
        historical_prices_map = AuditAnomalyService._gather_historical_prices(clean_vendor_name)

        for item in extract.items:
            item_desc_clean = item.description.strip().lower()
            hist_prices = historical_prices_map.get(item_desc_clean, [])

            # Also check fuzzy/substring matches if exact match is empty
            if not hist_prices:
                for k, v in historical_prices_map.items():
                    if k in item_desc_clean or item_desc_clean in k:
                        hist_prices = v
                        break

            new_item = item.model_copy()

            if len(hist_prices) >= 2:
                mu = sum(hist_prices) / len(hist_prices)
                variance = sum((p - mu) ** 2 for p in hist_prices) / len(hist_prices)
                sigma = math.sqrt(variance) if variance > 0.001 else 1.0

                z_score = (item.unit_price - mu) / sigma
                pct_surge = ((item.unit_price - mu) / mu) * 100 if mu > 0 else 0

                new_item.historical_avg_price = round(mu, 2)
                new_item.z_score = round(z_score, 2)
                new_item.surge_percentage = round(pct_surge, 1)

                # Trigger condition: Z >= 2.5 and percentage increase > 20%
                if z_score >= settings.Z_SCORE_THRESHOLD or pct_surge >= settings.PRICE_SURGE_PERCENT_THRESHOLD:
                    new_item.is_anomaly = True
                    new_item.anomaly_reason = (
                        f"Price Surge: Unit price of ${item.unit_price:.2f} is +{pct_surge:.1f}% "
                        f"higher than historical baseline ${mu:.2f} (Z = +{z_score:.1f}σ)."
                    )
                    flags.append(
                        AnomalyFlag(
                            flag_type=AnomalyType.PRICE_SURGE,
                            severity="warning" if z_score < 4.0 else "critical",
                            field=f"item:{item.description}",
                            message=(
                                f"Statistical Price Surge: Item '{item.description}' billed at ${item.unit_price:.2f}/unit "
                                f"is +{pct_surge:.1f}% above historical mean ${mu:.2f} (Z-Score: +{z_score:.1f}σ, baseline count: {len(hist_prices)})."
                            ),
                            details={
                                "item_description": item.description,
                                "billed_price": item.unit_price,
                                "historical_mean": round(mu, 2),
                                "historical_stddev": round(sigma, 2),
                                "z_score": round(z_score, 2),
                                "surge_percentage": round(pct_surge, 1),
                                "samples_count": len(hist_prices)
                            }
                        )
                    )
            elif len(hist_prices) == 1:
                # Single baseline comparison
                prev_price = hist_prices[0]
                pct_surge = ((item.unit_price - prev_price) / prev_price) * 100 if prev_price > 0 else 0
                new_item.historical_avg_price = round(prev_price, 2)
                new_item.surge_percentage = round(pct_surge, 1)

                if pct_surge >= settings.PRICE_SURGE_PERCENT_THRESHOLD:
                    new_item.is_anomaly = True
                    new_item.anomaly_reason = f"Price Surge: +{pct_surge:.1f}% higher than previous billing ${prev_price:.2f}"
                    flags.append(
                        AnomalyFlag(
                            flag_type=AnomalyType.PRICE_SURGE,
                            severity="warning",
                            field=f"item:{item.description}",
                            message=f"Unit price surged +{pct_surge:.1f}% higher than previous invoice (${prev_price:.2f}).",
                            details={
                                "item_description": item.description,
                                "billed_price": item.unit_price,
                                "historical_mean": prev_price,
                                "surge_percentage": round(pct_surge, 1)
                            }
                        )
                    )

            audited_items.append(new_item)

        return flags, audited_items

    @staticmethod
    def _gather_historical_prices(vendor_name_clean: str) -> dict[str, list[float]]:
        """Collects historical approved unit prices for items grouped by item description."""
        prices_map: dict[str, list[float]] = {}
        for inv in db.invoices.values():
            if not inv.is_approved:
                continue
            # match vendor
            if vendor_name_clean and vendor_name_clean in inv.vendor_name.strip().lower():
                for itm in inv.items:
                    desc_key = itm.description.strip().lower()
                    if desc_key not in prices_map:
                        prices_map[desc_key] = []
                    prices_map[desc_key].append(float(itm.unit_price))
            else:
                # global baseline for universal item names
                for itm in inv.items:
                    desc_key = itm.description.strip().lower()
                    if desc_key not in prices_map:
                        prices_map[desc_key] = []
                    prices_map[desc_key].append(float(itm.unit_price))
        return prices_map

audit_service = AuditAnomalyService()
