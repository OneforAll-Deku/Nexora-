import uuid
from typing import Dict, List, Optional
from datetime import datetime, date
from app.models.schemas import (
    InvoiceRecord, LineItem, AnomalyFlag, AnomalyType,
    VendorRecord, DocumentRecord, DocStatus
)

class DataStore:
    def __init__(self):
        self.vendors: Dict[str, VendorRecord] = {}
        self.documents: Dict[str, DocumentRecord] = {}
        self.invoices: Dict[str, InvoiceRecord] = {}
        self.provider: str = "google"
        self.gemini_model: str = "gemini-2.5-flash"
        self.openrouter_model: str = "meta-llama/llama-3.3-70b-instruct"
        self.selected_model: str = "gemini-2.5-flash"
        self.custom_gemini_models: List[Dict[str, Any]] = []
        self.encrypted_byok_key: Optional[str] = None
        self.byok_key_mask: str = "Not Configured"
        self.is_byok_valid: bool = False
        self.encrypted_openrouter_key: Optional[str] = None
        self.openrouter_key_mask: str = "Not Configured"
        self.is_openrouter_valid: bool = False
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seed realistic historical vendor ledgers and line items for statistical baseline calculation."""
        # 1. Vendor: Apex Logistics Corp
        v1_id = "ven-apex-01"
        self.vendors[v1_id] = VendorRecord(
            id=v1_id,
            name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            payment_terms="Net 30",
            total_invoices_count=4,
            total_spend=12450.00
        )

        # 2. Vendor: NexaCloud Software Inc.
        v2_id = "ven-nexa-02"
        self.vendors[v2_id] = VendorRecord(
            id=v2_id,
            name="NexaCloud Software Inc.",
            tax_id="US-EIN-12-8874109",
            payment_terms="Net 15",
            total_invoices_count=3,
            total_spend=8900.00
        )

        # 3. Vendor: FastShip Industrial Supplies
        v3_id = "ven-fastship-03"
        self.vendors[v3_id] = VendorRecord(
            id=v3_id,
            name="FastShip Industrial Supplies",
            tax_id="US-EIN-77-2291044",
            payment_terms="Net 30",
            total_invoices_count=5,
            total_spend=4520.00
        )

        # Historical Approved Invoices for Baseline Unit Price calculation
        # Baseline for 'Standard Pallet Shipping (Zone 4)': unit prices around $120.00 (std dev ~ $5.00)
        inv_hist_1 = InvoiceRecord(
            id="inv-hist-01",
            vendor_id=v1_id,
            vendor_name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            invoice_number="APX-2026-101",
            invoice_date="2026-07-15",
            due_date="2026-08-15",
            currency="USD",
            subtotal=3600.00,
            tax_amount=288.00,
            total_amount=3888.00,
            is_approved=True,
            items=[
                LineItem(id=str(uuid.uuid4()), description="Standard Pallet Shipping (Zone 4)", quantity=30.0, unit_price=120.00, total_price=3600.00)
            ],
            file_name="APX-2026-101.pdf"
        )
        inv_hist_2 = InvoiceRecord(
            id="inv-hist-02",
            vendor_id=v1_id,
            vendor_name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            invoice_number="APX-2026-102",
            invoice_date="2026-08-01",
            due_date="2026-08-31",
            currency="USD",
            subtotal=2440.00,
            tax_amount=195.20,
            total_amount=2635.20,
            is_approved=True,
            items=[
                LineItem(id=str(uuid.uuid4()), description="Standard Pallet Shipping (Zone 4)", quantity=20.0, unit_price=122.00, total_price=2440.00)
            ],
            file_name="APX-2026-102.pdf"
        )
        inv_hist_3 = InvoiceRecord(
            id="inv-hist-03",
            vendor_id=v1_id,
            vendor_name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            invoice_number="APX-2026-103",
            invoice_date="2026-08-15",
            due_date="2026-09-15",
            currency="USD",
            subtotal=3570.00,
            tax_amount=285.60,
            total_amount=3855.60,
            is_approved=True,
            items=[
                LineItem(id=str(uuid.uuid4()), description="Standard Pallet Shipping (Zone 4)", quantity=30.0, unit_price=119.00, total_price=3570.00)
            ],
            file_name="APX-2026-103.pdf"
        )

        # Baseline for 'Heavy Duty Corrugated Box (Pack of 50)': unit prices around $25.00
        inv_hist_4 = InvoiceRecord(
            id="inv-hist-04",
            vendor_id=v3_id,
            vendor_name="FastShip Industrial Supplies",
            tax_id="US-EIN-77-2291044",
            invoice_number="FS-88410",
            invoice_date="2026-08-10",
            due_date="2026-09-10",
            currency="USD",
            subtotal=1250.00,
            tax_amount=100.00,
            total_amount=1350.00,
            is_approved=True,
            items=[
                LineItem(id=str(uuid.uuid4()), description="Heavy Duty Corrugated Box (Pack of 50)", quantity=50.0, unit_price=25.00, total_price=1250.00)
            ],
            file_name="FS-88410.pdf"
        )

        for inv in [inv_hist_1, inv_hist_2, inv_hist_3, inv_hist_4]:
            self.invoices[inv.id] = inv

        # Seed 3 Demo Pending Invoices highlighting specific features:
        # Sample A: Clean Pending Invoice
        inv_demo_clean = InvoiceRecord(
            id="inv-demo-clean",
            vendor_id=v2_id,
            vendor_name="NexaCloud Software Inc.",
            tax_id="US-EIN-12-8874109",
            invoice_number="NEXA-2026-891",
            invoice_date="2026-09-01",
            due_date="2026-09-16",
            currency="USD",
            subtotal=1450.00,
            tax_amount=116.00,
            total_amount=1566.00,
            is_approved=False,
            reconciliation_flags=[],
            items=[
                LineItem(id=str(uuid.uuid4()), description="Enterprise Cloud Compute Tier 2 (Monthly)", quantity=1.0, unit_price=1200.00, total_price=1200.00),
                LineItem(id=str(uuid.uuid4()), description="Dedicated SSL Certificate & DNS Guard", quantity=1.0, unit_price=250.00, total_price=250.00)
            ],
            file_name="NexaCloud_Invoice_891.pdf",
            file_url="/samples/sample_clean.png"
        )
        self.invoices[inv_demo_clean.id] = inv_demo_clean

        # Sample B: Arithmetic Discrepancy Sample ($100 mismatch)
        inv_demo_math = InvoiceRecord(
            id="inv-demo-arithmetic",
            vendor_id=v3_id,
            vendor_name="FastShip Industrial Supplies",
            tax_id="US-EIN-77-2291044",
            invoice_number="FS-89022",
            invoice_date="2026-09-02",
            due_date="2026-10-02",
            currency="USD",
            subtotal=750.00,
            tax_amount=60.00,
            total_amount=910.00,  # Math error! 750 + 60 = 810 != 910 ($100 overbilled)
            is_approved=False,
            reconciliation_flags=[
                AnomalyFlag(
                    flag_type=AnomalyType.ARITHMETIC_MISMATCH,
                    severity="critical",
                    field="total_amount",
                    message="Arithmetic Mismatch: Sum of line items ($750.00) + Tax ($60.00) = $810.00, but Invoice Grand Total is stated as $910.00 (Discrepancy: +$100.00).",
                    details={"calculated_total": 810.00, "stated_total": 910.00, "delta": 100.00}
                )
            ],
            items=[
                LineItem(id=str(uuid.uuid4()), description="Heavy Duty Corrugated Box (Pack of 50)", quantity=30.0, unit_price=25.00, total_price=750.00)
            ],
            file_name="FastShip_Invoice_89022.pdf",
            file_url="/samples/sample_arithmetic_error.png"
        )
        self.invoices[inv_demo_math.id] = inv_demo_math

        # Sample C: Extreme Price Surge ($Z = 12.8\sigma$ on shipping)
        inv_demo_surge = InvoiceRecord(
            id="inv-demo-surge",
            vendor_id=v1_id,
            vendor_name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            invoice_number="APX-2026-199",
            invoice_date="2026-09-03",
            due_date="2026-10-03",
            currency="USD",
            subtotal=5250.00,
            tax_amount=420.00,
            total_amount=5670.00,
            is_approved=False,
            reconciliation_flags=[
                AnomalyFlag(
                    flag_type=AnomalyType.PRICE_SURGE,
                    severity="critical",
                    field="items[0].unit_price",
                    message="Statistical Price Surge Alert: 'Standard Pallet Shipping (Zone 4)' unit price of $210.00 is +74.5% higher than historical baseline of $120.33 (Z-Score: +17.9σ).",
                    details={"historical_avg": 120.33, "current_price": 210.00, "z_score": 17.9, "pct_change": 74.5}
                )
            ],
            items=[
                LineItem(
                    id=str(uuid.uuid4()),
                    description="Standard Pallet Shipping (Zone 4)",
                    quantity=25.0,
                    unit_price=210.00,  # Huge surge from $120
                    total_price=5250.00,
                    historical_avg_price=120.33,
                    z_score=17.9,
                    surge_percentage=74.5,
                    is_anomaly=True,
                    anomaly_reason="Price Surge (+74.5% above historical baseline $120.33)"
                )
            ],
            file_name="Apex_Surge_199.pdf",
            file_url="/samples/sample_surge.png"
        )
        self.invoices[inv_demo_surge.id] = inv_demo_surge

        # Sample D: Duplicate Invoice Sample
        inv_demo_dup = InvoiceRecord(
            id="inv-demo-duplicate",
            vendor_id=v1_id,
            vendor_name="Apex Logistics Corp",
            tax_id="US-EIN-94-3829104",
            invoice_number="APX-2026-101", # Duplicate of inv-hist-01
            invoice_date="2026-09-03",
            due_date="2026-10-03",
            currency="USD",
            subtotal=3600.00,
            tax_amount=288.00,
            total_amount=3888.00,
            is_approved=False,
            reconciliation_flags=[
                AnomalyFlag(
                    flag_type=AnomalyType.DUPLICATE_INVOICE,
                    severity="critical",
                    field="invoice_number",
                    message="Duplicate Billing Detected: Invoice #APX-2026-101 for vendor 'Apex Logistics Corp' was already approved on 2026-07-15 (ID: inv-hist-01).",
                    details={"original_invoice_id": "inv-hist-01", "invoice_number": "APX-2026-101"}
                )
            ],
            items=[
                LineItem(id=str(uuid.uuid4()), description="Standard Pallet Shipping (Zone 4)", quantity=30.0, unit_price=120.00, total_price=3600.00)
            ],
            file_name="Apex_Duplicate_101.pdf",
            file_url="/samples/sample_duplicate.png"
        )
        self.invoices[inv_demo_dup.id] = inv_demo_dup

db = DataStore()
