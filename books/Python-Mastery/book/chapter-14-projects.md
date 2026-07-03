# Chapter 14: Hands-On Projects

Congratulations — you've journeyed through Python fundamentals, control flow, functions, data structures, object-oriented programming, file I/O, error handling, testing, and every other core topic this book covers. Now it's time to put it all together. This chapter presents **five complete, fully-implemented projects** that demonstrate real-world Python development. Each project is self-contained, runnable, and builds on concepts from earlier chapters.

These aren't toy examples. Each project includes a database layer, proper error handling, tests, and a clean architecture. By the time you finish, you'll have built applications you can actually use — and a portfolio of code that proves you know Python.

---

## How to Use This Chapter

Each project follows the same structure:

| Section              | What You'll Find                                    |
|----------------------|-----------------------------------------------------|
| **Overview**         | What we're building and why it matters               |
| **Architecture**     | ASCII diagram of the system design                   |
| **Implementation**   | Complete, runnable code with commentary              |
| **How to Run**       | Step-by-step instructions to get it working          |
| **Extending**        | Ideas for taking the project further                 |

### Prerequisites

Install the third-party packages used across all projects:

```bash
pip install click requests beautifulsoup4 schedule
pip install fastapi uvicorn pydantic sqlalchemy
pip install pytest httpx pandas matplotlib jinja2
pip install pyjwt passlib[bcrypt]
```

Each project also works standalone — only install the packages it actually needs.

---
---

## 14.1 Project 1: Personal Expense Tracker (CLI)

### 14.1.1 Overview

A command-line expense tracker backed by SQLite. You can add expenses, list them, view summaries by month or category, delete entries, and export everything to CSV. It's the kind of tool you'll actually use daily.

**Features:**

- Add expenses with date, category, amount, and description
- List all expenses or filter by category/date range
- Monthly and category-wise summary reports
- Delete individual expenses by ID
- Export all data to CSV
- Persistent SQLite storage
- Input validation on every field

### 14.1.2 Architecture

```
┌─────────────────────────────────────────────┐
│              CLI Interface (Click)           │
│  add │ list │ summary │ delete │ export     │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│             ExpenseManager                   │
│  • add_expense()                             │
│  • list_expenses()                           │
│  • get_summary()                             │
│  • delete_expense()                          │
│  • export_csv()                              │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│          SQLite Database (expenses.db)       │
│  expenses: id, date, category, amount, desc  │
└─────────────────────────────────────────────┘
```

### 14.1.3 Implementation

Create a file called `expense_tracker.py`:

```python
#!/usr/bin/env python3
"""Personal Expense Tracker — a CLI tool for tracking daily expenses."""

import csv
import sqlite3
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Optional

import click


# ─── Data Model ────────────────────────────────────────────────

@dataclass
class Expense:
    """Represents a single expense entry."""
    id: Optional[int]
    expense_date: date
    category: str
    amount: float
    description: str


# ─── Database Layer ────────────────────────────────────────────

DB_PATH = Path("expenses.db")

VALID_CATEGORIES = [
    "food", "transport", "housing", "utilities",
    "entertainment", "health", "education", "shopping", "other",
]


def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Create a database connection with row factory enabled."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    """Create the expenses table if it doesn't exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            date        TEXT    NOT NULL,
            category    TEXT    NOT NULL,
            amount      REAL    NOT NULL CHECK (amount > 0),
            description TEXT    NOT NULL
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_expenses_date
        ON expenses (date)
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_expenses_category
        ON expenses (category)
    """)
    conn.commit()


# ─── Manager ───────────────────────────────────────────────────

class ExpenseManager:
    """Business logic for managing expenses."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def add_expense(self, expense: Expense) -> int:
        """Insert a new expense and return its ID."""
        cursor = self.conn.execute(
            "INSERT INTO expenses (date, category, amount, description) "
            "VALUES (?, ?, ?, ?)",
            (
                expense.expense_date.isoformat(),
                expense.category.lower(),
                round(expense.amount, 2),
                expense.description.strip(),
            ),
        )
        self.conn.commit()
        return cursor.lastrowid

    def list_expenses(
        self,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> list[Expense]:
        """Retrieve expenses with optional filters."""
        query = "SELECT * FROM expenses WHERE 1=1"
        params: list = []

        if category:
            query += " AND category = ?"
            params.append(category.lower())
        if start_date:
            query += " AND date >= ?"
            params.append(start_date.isoformat())
        if end_date:
            query += " AND date <= ?"
            params.append(end_date.isoformat())

        query += " ORDER BY date DESC, id DESC"
        rows = self.conn.execute(query, params).fetchall()
        return [
            Expense(
                id=row["id"],
                expense_date=date.fromisoformat(row["date"]),
                category=row["category"],
                amount=row["amount"],
                description=row["description"],
            )
            for row in rows
        ]

    def get_summary(self, year: int, month: int) -> dict:
        """Return monthly summary with total and per-category breakdown."""
        month_str = f"{year:04d}-{month:02d}"
        rows = self.conn.execute(
            "SELECT category, SUM(amount) as total, COUNT(*) as count "
            "FROM expenses WHERE date LIKE ? "
            "GROUP BY category ORDER BY total DESC",
            (f"{month_str}%",),
        ).fetchall()

        categories = {row["category"]: {"total": row["total"], "count": row["count"]} for row in rows}
        grand_total = sum(c["total"] for c in categories.values())

        return {
            "year": year,
            "month": month,
            "categories": categories,
            "grand_total": grand_total,
            "expense_count": sum(c["count"] for c in categories.values()),
        }

    def delete_expense(self, expense_id: int) -> bool:
        """Delete an expense by ID. Returns True if a row was deleted."""
        cursor = self.conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        self.conn.commit()
        return cursor.rowcount > 0

    def export_csv(self, filepath: Path) -> int:
        """Export all expenses to a CSV file. Returns the number of rows written."""
        expenses = self.list_expenses()
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Date", "Category", "Amount", "Description"])
            for e in expenses:
                writer.writerow([e.id, e.expense_date.isoformat(), e.category, e.amount, e.description])
        return len(expenses)


# ─── CLI ───────────────────────────────────────────────────────

@click.group()
@click.option("--db", default="expenses.db", help="Path to SQLite database file.")
@click.pass_context
def cli(ctx: click.Context, db: str) -> None:
    """Personal Expense Tracker — manage your daily spending."""
    ctx.ensure_object(dict)
    ctx.obj["db_path"] = Path(db)
    conn = get_connection(ctx.obj["db_path"])
    init_db(conn)
    ctx.obj["manager"] = ExpenseManager(conn)


def parse_date(date_str: str) -> date:
    """Parse a date string in YYYY-MM-DD format."""
    try:
        return date.fromisoformat(date_str)
    except ValueError:
        raise click.BadParameter(f"Invalid date format: {date_str!r}. Use YYYY-MM-DD.")


def validate_category(ctx: click.Context, param: click.Parameter, value: str) -> str:
    """Ensure the category is one of the predefined values."""
    if value.lower() not in VALID_CATEGORIES:
        raise click.BadParameter(
            f"Invalid category: {value!r}. "
            f"Choose from: {', '.join(VALID_CATEGORIES)}"
        )
    return value.lower()


@cli.command()
@click.option("--date", "exp_date", default=None, help="Date (YYYY-MM-DD). Defaults to today.")
@click.option("--category", callback=validate_category, help=f"Category: {', '.join(VALID_CATEGORIES)}")
@click.option("--amount", type=float, required=True, help="Expense amount (positive number).")
@click.option("--description", "-d", required=True, help="Short description.")
@click.pass_context
def add(ctx: click.Context, exp_date: Optional[str], category: str, amount: float, description: str) -> None:
    """Add a new expense entry."""
    if amount <= 0:
        raise click.BadParameter("Amount must be a positive number.")

    expense_date = parse_date(exp_date) if exp_date else date.today()

    expense = Expense(
        id=None,
        expense_date=expense_date,
        category=category,
        amount=amount,
        description=description,
    )

    manager: ExpenseManager = ctx.obj["manager"]
    expense_id = manager.add_expense(expense)
    click.echo(f"✓ Expense #{expense_id} added: ${amount:.2f} ({category}) on {expense_date}")


@cli.command()
@click.option("--category", default=None, callback=validate_category, help="Filter by category.")
@click.option("--start", default=None, help="Start date (YYYY-MM-DD).")
@click.option("--end", default=None, help="End date (YYYY-MM-DD).")
@click.pass_context
def list(ctx: click.Context, category: Optional[str], start: Optional[str], end: Optional[str]) -> None:
    """List expenses with optional filters."""
    manager: ExpenseManager = ctx.obj["manager"]
    start_date = parse_date(start) if start else None
    end_date = parse_date(end) if end else None

    expenses = manager.list_expenses(category=category, start_date=start_date, end_date=end_date)

    if not expenses:
        click.echo("No expenses found.")
        return

    click.echo(f"\n{'ID':>4}  {'Date':12}  {'Category':14}  {'Amount':>10}  Description")
    click.echo("─" * 70)

    total = 0.0
    for e in expenses:
        click.echo(f"{e.id:>4}  {e.expense_date.isoformat():12}  {e.category:14}  ${e.amount:>9.2f}  {e.description}")
        total += e.amount

    click.echo("─" * 70)
    click.echo(f"{'':>30} Total: ${total:>9.2f}  ({len(expenses)} expenses)\n")


@cli.command()
@click.option("--year", type=int, default=None, help="Year (YYYY). Defaults to current year.")
@click.option("--month", type=int, default=None, help="Month (1-12). Defaults to current month.")
@click.pass_context
def summary(ctx: click.Context, year: Optional[int], month: Optional[int]) -> None:
    """Show monthly spending summary by category."""
    today = date.today()
    year = year or today.year
    month = month or today.month

    if not 1 <= month <= 12:
        raise click.BadParameter("Month must be between 1 and 12.")

    manager: ExpenseManager = ctx.obj["manager"]
    result = manager.get_summary(year, month)

    click.echo(f"\n  Summary for {year:04d}-{month:02d}")
    click.echo("  " + "═" * 40)

    if not result["categories"]:
        click.echo("  No expenses for this month.\n")
        return

    for cat, info in result["categories"].items():
        pct = (info["total"] / result["grand_total"]) * 100
        bar = "█" * int(pct / 3)
        click.echo(f"  {cat:14}  ${info['total']:>9.2f}  ({info['count']:>2} entries)  {bar}")

    click.echo("  " + "─" * 40)
    click.echo(f"  {'TOTAL':14}  ${result['grand_total']:>9.2f}  ({result['expense_count']:>2} entries)")
    click.echo()


@cli.command()
@click.argument("expense_id", type=int)
@click.pass_context
def delete(ctx: click.Context, expense_id: int) -> None:
    """Delete an expense by its ID."""
    manager: ExpenseManager = ctx.obj["manager"]
    if manager.delete_expense(expense_id):
        click.echo(f"✓ Expense #{expense_id} deleted.")
    else:
        click.echo(f"✗ Expense #{expense_id} not found.")


@cli.command("export")
@click.argument("filepath", type=click.Path())
@click.pass_context
def export_csv(ctx: click.Context, filepath: str) -> None:
    """Export all expenses to a CSV file."""
    manager: ExpenseManager = ctx.obj["manager"]
    count = manager.export_csv(Path(filepath))
    click.echo(f"✓ Exported {count} expenses to {filepath}")


def main() -> None:
    """Entry point for the CLI."""
    cli(obj={})


if __name__ == "__main__":
    main()
```

### 14.1.4 How to Run

```bash
# Add expenses
python expense_tracker.py add --category food --amount 12.50 -d "Lunch at cafe"
python expense_tracker.py add --date 2026-07-01 --category transport --amount 45.00 -d "Gas fill-up"
python expense_tracker.py add --category entertainment --amount 15.99 -d "Movie ticket"

# List all expenses
python expense_tracker.py list

# Filter by category
python expense_tracker.py list --category food

# Monthly summary
python expense_tracker.py summary --year 2026 --month 7

# Delete an expense
python expense_tracker.py delete 1

# Export to CSV
python expense_tracker.py export expenses_report.csv
```

### 14.1.5 Ideas for Extending

- Add **recurring expenses** that auto-generate each month
- Implement a **budget** system with per-category limits and warnings
- Build a **web interface** using Flask or Streamlit
- Add **multi-currency** support with exchange rate lookups
- Generate **Matplotlib charts** for visual spending trends

---
---

## 14.2 Project 2: Web Scraper & Price Monitor

### 14.2.1 Overview

A web scraper that monitors product prices across retailers. It stores price history in SQLite, sends email alerts when a price drops below your target, and runs on a configurable schedule. This is the project that pays for itself — track prices and never overpay.

**Features:**

- Scrape product pages using `requests` + BeautifulSoup
- Store full price history in SQLite
- Email alerts when price drops below threshold
- JSON-based configuration for products and settings
- Scheduled scraping with the `schedule` library
- CSV export of price history
- Retry logic with exponential backoff
- Detailed logging

### 14.2.2 Architecture

```
┌──────────────────────────────────────────────────────┐
│                  config.json                          │
│  products: [{url, name, selector, target_price}]     │
│  email: {smtp_host, user, password, recipient}       │
│  schedule: {interval_minutes}                        │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│                  Scheduler Loop                       │
│           (every N minutes via schedule)              │
└────────┬───────────────────────┬─────────────────────┘
         │                       │
┌────────▼──────────┐  ┌────────▼────────────────────┐
│   PriceScraper     │  │      EmailAlertService       │
│  • fetch_page()    │  │  • send_alert()              │
│  • parse_price()   │  │  • SMTP connection           │
│  • retry logic     │  │  • HTML email template       │
└────────┬──────────┘  └────────▲────────────────────┘
         │                       │
┌────────▼───────────────────────┴────────────────────┐
│              SQLite (prices.db)                      │
│  products: id, url, name, target_price               │
│  price_history: id, product_id, price, timestamp     │
└─────────────────────────────────────────────────────┘
```

### 14.2.3 Implementation

Create `config.json`:

```json
{
    "products": [
        {
            "name": "Example Laptop",
            "url": "https://example.com/product/laptop-123",
            "price_selector": "span.price-main",
            "target_price": 899.99
        },
        {
            "name": "Wireless Mouse",
            "url": "https://example.com/product/mouse-456",
            "price_selector": ".product-price .current",
            "target_price": 29.99
        }
    ],
    "email": {
        "enabled": false,
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "use_tls": true,
        "sender": "your-email@gmail.com",
        "password": "your-app-password",
        "recipient": "alert-recipient@gmail.com"
    },
    "schedule": {
        "interval_minutes": 60
    },
    "scraping": {
        "max_retries": 3,
        "retry_delay_seconds": 5,
        "timeout_seconds": 30,
        "user_agent": "PriceMonitor/1.0"
    }
}
```

Create `price_monitor.py`:

```python
#!/usr/bin/env python3
"""Web Scraper & Price Monitor — track product prices and get alerts."""

import csv
import json
import logging
import smtplib
import sqlite3
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

# ─── Logging ───────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("price_monitor")


# ─── Data Models ───────────────────────────────────────────────

@dataclass
class Product:
    """A product to monitor."""
    name: str
    url: str
    price_selector: str
    target_price: float
    id: Optional[int] = None


@dataclass
class PriceRecord:
    """A single price observation."""
    product_id: int
    price: float
    timestamp: str
    id: Optional[int] = None


# ─── Configuration ─────────────────────────────────────────────

@dataclass
class EmailConfig:
    enabled: bool
    smtp_host: str
    smtp_port: int
    use_tls: bool
    sender: str
    password: str
    recipient: str


@dataclass
class ScrapingConfig:
    max_retries: int
    retry_delay_seconds: int
    timeout_seconds: int
    user_agent: str


def load_config(path: Path = Path("config.json")) -> dict:
    """Load configuration from a JSON file."""
    if not path.exists():
        logger.error(f"Config file not found: {path}")
        sys.exit(1)

    with open(path) as f:
        config = json.load(f)

    # Validate required sections
    for section in ("products", "email", "scraping"):
        if section not in config:
            logger.error(f"Missing required config section: {section}")
            sys.exit(1)

    return config


# ─── Database ──────────────────────────────────────────────────

class PriceDatabase:
    """SQLite storage for products and price history."""

    def __init__(self, db_path: Path = Path("prices.db")) -> None:
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_tables()

    def _init_tables(self) -> None:
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                url         TEXT NOT NULL UNIQUE,
                selector    TEXT NOT NULL,
                target_price REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS price_history (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id  INTEGER NOT NULL,
                price       REAL NOT NULL,
                timestamp   TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
            CREATE INDEX IF NOT EXISTS idx_ph_product
            ON price_history (product_id, timestamp);
        """)
        self.conn.commit()

    def upsert_product(self, product: Product) -> int:
        """Insert or update a product, returning its ID."""
        existing = self.conn.execute(
            "SELECT id FROM products WHERE url = ?", (product.url,)
        ).fetchone()

        if existing:
            self.conn.execute(
                "UPDATE products SET name = ?, selector = ?, target_price = ? WHERE id = ?",
                (product.name, product.price_selector, product.target_price, existing["id"]),
            )
            self.conn.commit()
            return existing["id"]

        cursor = self.conn.execute(
            "INSERT INTO products (name, url, selector, target_price) VALUES (?, ?, ?, ?)",
            (product.name, product.url, product.price_selector, product.target_price),
        )
        self.conn.commit()
        return cursor.lastrowid

    def record_price(self, product_id: int, price: float) -> None:
        """Record a price observation with current timestamp."""
        self.conn.execute(
            "INSERT INTO price_history (product_id, price, timestamp) VALUES (?, ?, ?)",
            (product_id, price, datetime.now().isoformat()),
        )
        self.conn.commit()

    def get_latest_price(self, product_id: int) -> Optional[float]:
        """Get the most recent price for a product."""
        row = self.conn.execute(
            "SELECT price FROM price_history "
            "WHERE product_id = ? ORDER BY timestamp DESC LIMIT 1",
            (product_id,),
        ).fetchone()
        return row["price"] if row else None

    def get_price_history(self, product_id: int) -> list[dict]:
        """Get all price records for a product."""
        rows = self.conn.execute(
            "SELECT * FROM price_history WHERE product_id = ? ORDER BY timestamp",
            (product_id,),
        ).fetchall()
        return [dict(row) for row in rows]

    def get_all_products(self) -> list[Product]:
        """Get all monitored products."""
        rows = self.conn.execute("SELECT * FROM products").fetchall()
        return [
            Product(
                id=row["id"],
                name=row["name"],
                url=row["url"],
                price_selector=row["selector"],
                target_price=row["target_price"],
            )
            for row in rows
        ]

    def close(self) -> None:
        self.conn.close()


# ─── Scraper ───────────────────────────────────────────────────

class PriceScraper:
    """Fetches and parses prices from web pages with retry logic."""

    def __init__(self, config: ScrapingConfig) -> None:
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": config.user_agent})

    def fetch_price(self, url: str, selector: str) -> Optional[float]:
        """Fetch a page and extract the price using a CSS selector."""
        last_error: Optional[Exception] = None

        for attempt in range(1, self.config.max_retries + 1):
            try:
                logger.info(f"Fetching {url} (attempt {attempt}/{self.config.max_retries})")

                response = self.session.get(url, timeout=self.config.timeout_seconds)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")
                element = soup.select_one(selector)

                if element is None:
                    raise ValueError(f"Selector '{selector}' matched no elements on page")

                price_text = element.get_text(strip=True)
                price = self._parse_price(price_text)

                logger.info(f"Found price: ${price:.2f}")
                return price

            except Exception as e:
                last_error = e
                logger.warning(f"Attempt {attempt} failed: {e}")
                if attempt < self.config.max_retries:
                    delay = self.config.retry_delay_seconds * attempt
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)

        logger.error(f"All {self.config.max_retries} attempts failed for {url}: {last_error}")
        return None

    def _parse_price(self, text: str) -> float:
        """Extract a numeric price from text like '$1,299.99'."""
        import re
        # Remove currency symbols, commas, and whitespace
        cleaned = re.sub(r"[^\d.]", "", text)
        if not cleaned:
            raise ValueError(f"Could not parse price from text: {text!r}")
        return float(cleaned)

    def close(self) -> None:
        self.session.close()


# ─── Email Alerts ──────────────────────────────────────────────

class EmailAlertService:
    """Sends email notifications when price drops below target."""

    def __init__(self, config: EmailConfig) -> None:
        self.config = config

    def send_alert(self, product_name: str, current_price: float, target_price: float, url: str) -> bool:
        """Send a price alert email. Returns True on success."""
        if not self.config.enabled:
            logger.info(f"Email disabled. Would alert: {product_name} now ${current_price:.2f} "
                        f"(target: ${target_price:.2f})")
            return True

        subject = f"Price Alert: {product_name} is now ${current_price:.2f}!"
        savings = target_price - current_price

        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2ecc71;">💰 Price Drop Alert!</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h3>{product_name}</h3>
                <p style="font-size: 24px; color: #27ae60; font-weight: bold;">
                    ${current_price:.2f}
                </p>
                <p>Target price: ${target_price:.2f}</p>
                <p style="color: #27ae60;">You save: ${savings:.2f}</p>
                <a href="{url}"
                   style="display: inline-block; background: #3498db; color: white;
                          padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    View Product →
                </a>
            </div>
            <p style="color: #7f8c8d; font-size: 12px;">
                Sent by Price Monitor • {datetime.now().strftime('%Y-%m-%d %H:%M')}
            </p>
        </body>
        </html>
        """

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.config.sender
            msg["To"] = self.config.recipient
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port) as server:
                if self.config.use_tls:
                    server.starttls()
                server.login(self.config.sender, self.config.password)
                server.sendmail(self.config.sender, self.config.recipient, msg.as_string())

            logger.info(f"Alert email sent for {product_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False


# ─── CSV Export ────────────────────────────────────────────────

def export_price_history(db: PriceDatabase, filepath: Path) -> int:
    """Export all price history to CSV. Returns row count."""
    products = db.get_all_products()
    total = 0

    with open(filepath, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Product", "URL", "Price", "Timestamp"])

        for product in products:
            history = db.get_price_history(product.id)
            for record in history:
                writer.writerow([product.name, product.url, record["price"], record["timestamp"]])
                total += 1

    logger.info(f"Exported {total} records to {filepath}")
    return total


# ─── Main Monitor Loop ─────────────────────────────────────────

def run_check_cycle(config: dict, db: PriceDatabase) -> None:
    """Execute one cycle: scrape all products, record prices, send alerts."""
    scraping_cfg = ScrapingConfig(**config["scraping"])
    email_cfg = EmailConfig(**config["email"])
    scraper = PriceScraper(scrapering_cfg)
    alerter = EmailAlertService(email_cfg)

    for product_cfg in config["products"]:
        product = Product(
            name=product_cfg["name"],
            url=product_cfg["url"],
            price_selector=product_cfg["price_selector"],
            target_price=product_cfg["target_price"],
        )

        product_id = db.upsert_product(product)
        price = scraper.fetch_price(product.url, product.price_selector)

        if price is not None:
            db.record_price(product_id, price)

            if price <= product.target_price:
                logger.info(f"🎯 Price target met: {product.name} = ${price:.2f} "
                            f"(target: ${product.target_price:.2f})")
                alerter.send_alert(product.name, price, product.target_price, product.url)
        else:
            logger.warning(f"Could not fetch price for {product.name}")

    scraper.close()


def main() -> None:
    """Entry point — run the price monitor."""
    import argparse

    parser = argparse.ArgumentParser(description="Price Monitor & Alert System")
    parser.add_argument("--config", default="config.json", help="Path to config file")
    parser.add_argument("--once", action="store_true", help="Run once and exit (no scheduling)")
    parser.add_argument("--export", type=str, help="Export price history to CSV")
    args = parser.parse_args()

    config = load_config(Path(args.config))
    db = PriceDatabase()

    if args.export:
        count = export_price_history(db, Path(args.export))
        print(f"Exported {count} records to {args.export}")
        db.close()
        return

    if args.once:
        run_check_cycle(config, db)
        db.close()
        return

    # Scheduled mode
    try:
        import schedule
    except ImportError:
        logger.error("Install 'schedule' for continuous monitoring: pip install schedule")
        sys.exit(1)

    interval = config["schedule"]["interval_minutes"]
    logger.info(f"Starting price monitor — checking every {interval} minutes")

    # Run immediately, then schedule
    run_check_cycle(config, db)
    schedule.every(interval).minutes.do(run_check_cycle, config=config, db=db)

    try:
        while True:
            schedule.run_pending()
            time.sleep(10)
    except KeyboardInterrupt:
        logger.info("Monitor stopped.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
```

### 14.2.4 How to Run

```bash
# Edit config.json with your target products and email settings

# Run a single check
python price_monitor.py --once

# Export price history
python price_monitor.py --export history.csv

# Start continuous monitoring (Ctrl+C to stop)
python price_monitor.py
```

### 14.2.5 Ideas for Extending

- Add **Telegram or Slack notifications** alongside email
- Track **multiple retailers** for the same product to compare prices
- Build a **web dashboard** showing price history charts
- Add **proxies and rotating User-Agents** for anti-bot evasion
- Implement **database cleanup** to prune old records after N months

---
---

## 14.3 Project 3: REST API with FastAPI

### 14.3.1 Overview

A complete task management REST API with user authentication, pagination, filtering, and automatic documentation. This is the kind of project that teaches you production-ready API patterns — and FastAPI makes it a joy.

**Features:**

- Full CRUD for tasks (create, read, update, delete)
- User registration and JWT authentication
- Pydantic models for request/response validation
- SQLite with SQLAlchemy ORM
- Auto-generated Swagger and ReDoc documentation
- Pagination and filtering on list endpoints
- Comprehensive test suite with pytest

### 14.3.2 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser / curl)               │
│              Swagger UI at /docs                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON)
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Application                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Auth     │  │  Tasks   │  │  Middleware           │   │
│  │  Router   │  │  Router  │  │  • CORS              │   │
│  │ POST      │  │ GET      │  │  • JWT Validation    │   │
│  │ /register │  │ POST     │  │  • Error Handlers    │   │
│  │ POST      │  │ PUT      │  └──────────────────────┘   │
│  │ /login    │  │ DELETE   │                              │
│  └─────┬────┘  └────┬─────┘                              │
│        │             │                                    │
│  ┌─────▼─────────────▼────────────────────────────────┐  │
│  │         Pydantic Schemas (validation)               │  │
│  └─────────────────────┬──────────────────────────────┘  │
│                        │                                  │
│  ┌─────────────────────▼──────────────────────────────┐  │
│  │           SQLAlchemy ORM (models)                   │  │
│  └─────────────────────┬──────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│               SQLite (tasks.db)                           │
│   users: id, username, email, hashed_password             │
│   tasks: id, title, description, status, priority,       │
│          owner_id, created_at, updated_at                 │
└─────────────────────────────────────────────────────────┘
```

### 14.3.3 Implementation

Create `api_project/` directory with these files:

**`api_project/models.py`** — SQLAlchemy ORM models:

```python
"""Database models for the Task Management API."""

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.username!r}>"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(
        Enum("pending", "in_progress", "completed", "cancelled", name="task_status"),
        default="pending",
        nullable=False,
    )
    priority = Column(
        Enum("low", "medium", "high", "urgent", name="task_priority"),
        default="medium",
        nullable=False,
    )
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task {self.title!r} [{self.status}]>"


# ─── Database Setup ───────────────────────────────────────────

DATABASE_URL = "sqlite:///./tasks.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def init_db() -> None:
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
```

**`api_project/schemas.py`** — Pydantic validation models:

```python
"""Pydantic schemas for request/response validation."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


# ─── User Schemas ─────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ─── Task Schemas ─────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
    pages: int
```

**`api_project/auth.py`** — Authentication utilities:

```python
"""JWT authentication utilities."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .models import User

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int | None:
    """Decode a JWT token and return the user ID, or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except jwt.PyJWTError:
        return None


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Fetch a user by ID."""
    return db.query(User).filter(User.id == user_id).first()
```

**`api_project/main.py`** — The application entry point with all routes:

```python
"""Task Management REST API — FastAPI application."""

import math
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    decode_access_token,
    get_user_by_id,
    hash_password,
    verify_password,
)
from .models import Task, User, engine, init_db
from .schemas import (
    PaginatedResponse,
    TaskCreate,
    TaskPriority,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
    Token,
    UserCreate,
    UserResponse,
)

# ─── App Setup ────────────────────────────────────────────────

app = FastAPI(
    title="Task Manager API",
    description="A complete task management REST API with JWT authentication.",
    version="1.0.0",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    """Dependency that provides a database session."""
    from sqlalchemy.orm import sessionmaker

    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Dependency to extract and validate the current user from JWT."""
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@app.on_event("startup")
def startup() -> None:
    init_db()


# ─── Auth Endpoints ───────────────────────────────────────────

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Annotated[Session, Depends(get_db)]) -> User:
    """Register a new user account."""
    # Check for existing username or email
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=Token)
def login(user_data: UserCreate, db: Annotated[Session, Depends(get_db)]) -> dict:
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


# ─── Task Endpoints ───────────────────────────────────────────

@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Task:
    """Create a new task for the authenticated user."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status.value,
        priority=task_data.priority.value,
        owner_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks", response_model=PaginatedResponse)
def list_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    status_filter: Annotated[TaskStatus | None, Query(alias="status")] = None,
    priority_filter: Annotated[TaskPriority | None, Query(alias="priority")] = None,
) -> dict:
    """List tasks for the authenticated user with pagination and filtering."""
    query = db.query(Task).filter(Task.owner_id == current_user.id)

    if status_filter:
        query = query.filter(Task.status == status_filter.value)
    if priority_filter:
        query = query.filter(Task.priority == priority_filter.value)

    total = query.count()
    pages = math.ceil(total / page_size) if total > 0 else 1
    tasks = query.order_by(Task.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Task:
    """Get a specific task by ID."""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Task:
    """Update a task. Only provided fields are changed."""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for field, value in update_data.items():
        setattr(task, field, value.value if hasattr(value, "value") else value)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete a task."""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# ─── Health Check ─────────────────────────────────────────────

@app.get("/health")
def health_check() -> dict:
    """API health check endpoint."""
    return {"status": "ok", "service": "Task Manager API"}
```

**`api_project/tests/test_api.py`** — Comprehensive test suite:

```python
"""Tests for the Task Management API."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..main import app, get_db
from ..models import Base


# ─── Test Database Setup ───────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_tasks.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create and tear down test tables for each test."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_user(client):
    """Register and return user data."""
    user_data = {"username": "testuser", "email": "test@example.com", "password": "secret123"}
    client.post("/register", json=user_data)
    return user_data


@pytest.fixture
def auth_token(client, registered_user):
    """Login and return JWT token."""
    response = client.post("/login", json=registered_user)
    return response.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ─── Auth Tests ────────────────────────────────────────────────

class TestAuthentication:
    def test_register_success(self, client):
        response = client.post("/register", json={
            "username": "alice", "email": "alice@example.com", "password": "pass123"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "alice"
        assert "id" in data

    def test_register_duplicate_username(self, client, registered_user):
        response = client.post("/register", json=registered_user)
        assert response.status_code == 409

    def test_login_success(self, client, registered_user):
        response = client.post("/login", json=registered_user)
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self, client, registered_user):
        response = client.post("/login", json={**registered_user, "password": "wrong"})
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post("/login", json={
            "username": "ghost", "email": "x@x.com", "password": "pass"
        })
        assert response.status_code == 401


# ─── Task Tests ────────────────────────────────────────────────

class TestTasks:
    def test_create_task(self, client, auth_token):
        response = client.post("/tasks", json={
            "title": "Write tests",
            "description": "Cover all endpoints",
            "priority": "high",
        }, headers=auth_headers(auth_token))
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Write tests"
        assert data["status"] == "pending"
        assert data["priority"] == "high"

    def test_list_tasks_empty(self, client, auth_token):
        response = client.get("/tasks", headers=auth_headers(auth_token))
        assert response.status_code == 200
        assert response.json()["total"] == 0

    def test_list_tasks_with_data(self, client, auth_token):
        for i in range(5):
            client.post("/tasks", json={"title": f"Task {i}"}, headers=auth_headers(auth_token))

        response = client.get("/tasks", headers=auth_headers(auth_token))
        assert response.json()["total"] == 5

    def test_list_tasks_pagination(self, client, auth_token):
        for i in range(15):
            client.post("/tasks", json={"title": f"Task {i}"}, headers=auth_headers(auth_token))

        response = client.get("/tasks?page=1&page_size=5", headers=auth_headers(auth_token))
        data = response.json()
        assert len(data["items"]) == 5
        assert data["total"] == 15
        assert data["pages"] == 3

    def test_list_tasks_filter_status(self, client, auth_token):
        client.post("/tasks", json={"title": "Pending", "status": "pending"}, headers=auth_headers(auth_token))
        client.post("/tasks", json={"title": "Done", "status": "completed"}, headers=auth_headers(auth_token))

        response = client.get("/tasks?status=completed", headers=auth_headers(auth_token))
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "Done"

    def test_get_task(self, client, auth_token):
        create = client.post("/tasks", json={"title": "Get me"}, headers=auth_headers(auth_token))
        task_id = create.json()["id"]

        response = client.get(f"/tasks/{task_id}", headers=auth_headers(auth_token))
        assert response.status_code == 200
        assert response.json()["title"] == "Get me"

    def test_get_nonexistent_task(self, client, auth_token):
        response = client.get("/tasks/9999", headers=auth_headers(auth_token))
        assert response.status_code == 404

    def test_update_task(self, client, auth_token):
        create = client.post("/tasks", json={"title": "Original"}, headers=auth_headers(auth_token))
        task_id = create.json()["id"]

        response = client.put(
            f"/tasks/{task_id}",
            json={"title": "Updated", "status": "completed"},
            headers=auth_headers(auth_token),
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated"
        assert response.json()["status"] == "completed"

    def test_delete_task(self, client, auth_token):
        create = client.post("/tasks", json={"title": "Delete me"}, headers=auth_headers(auth_token))
        task_id = create.json()["id"]

        response = client.delete(f"/tasks/{task_id}", headers=auth_headers(auth_token))
        assert response.status_code == 204

        # Confirm deleted
        response = client.get(f"/tasks/{task_id}", headers=auth_headers(auth_token))
        assert response.status_code == 404

    def test_unauthorized_access(self, client):
        response = client.get("/tasks")
        assert response.status_code in (401, 403)
```

### 14.3.4 How to Run

```bash
# Start the server
uvicorn api_project.main:app --reload

# Browse the auto-generated docs
# Swagger UI:   http://127.0.0.1:8000/docs
# ReDoc:        http://127.0.0.1:8000/redoc

# Run the tests
pytest api_project/tests/ -v
```

### 14.3.5 Example API Usage

```bash
# Register
curl -X POST http://127.0.0.1:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "secret123"}'

# Login and capture token
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "secret123"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Create a task
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI", "priority": "high"}'

# List tasks with pagination
curl "http://127.0.0.1:8000/tasks?page=1&page_size=5" \
  -H "Authorization: Bearer $TOKEN"
```

### 14.3.6 Ideas for Extending

- Add **task categories and labels** with a many-to-many relationship
- Implement **task assignment** between users
- Add **WebSocket notifications** for real-time updates
- Deploy with **Docker + PostgreSQL** for production
- Add **rate limiting** and **CORS** configuration
- Implement **refresh tokens** for longer-lived sessions

---
---

## 14.4 Project 4: Data Analysis Dashboard

### 14.4.1 Overview

A complete data analysis pipeline that generates sample sales data, cleans and transforms it with Pandas, performs statistical analysis, creates visualizations with Matplotlib, and produces an HTML report. It's the full EDA (Exploratory Data Analysis) workflow in one script.

**Features:**

- Generate realistic sample sales data (or load your own CSV)
- Clean and transform with Pandas
- Statistical summary (mean, median, std, percentiles)
- Correlation analysis
- Matplotlib visualizations: bar charts, line plots, histograms, heatmaps
- Self-contained HTML report with embedded charts
- Command-line options for data source and report output

### 14.4.2 Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLI Arguments                      │
│        --input data.csv │ --output report.html       │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              DataPipeline                             │
│                                                       │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  1. Load  │→ │ 2. Clean   │→ │ 3. Analyze       │ │
│  │  /Generate│  │  /Transform│  │  Statistics      │ │
│  └──────────┘  └────────────┘  └────────┬─────────┘ │
│                                          │            │
│  ┌──────────────────────────┐  ┌────────▼─────────┐ │
│  │  5. Generate HTML Report │← │ 4. Visualize     │ │
│  │  (Jinja2 template)       │  │ (Matplotlib)     │ │
│  └──────────────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 14.4.3 Implementation

Create `data_dashboard.py`:

```python
#!/usr/bin/env python3
"""Data Analysis Dashboard — generate, analyze, and visualize sales data."""

import base64
import io
import math
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for report generation
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from jinja2 import Template


# ─── Data Generation ───────────────────────────────────────────

def generate_sales_data(n_rows: int = 1000, seed: int = 42) -> pd.DataFrame:
    """Generate realistic sample sales data."""
    random.seed(seed)
    np.random.seed(seed)

    categories = ["Electronics", "Clothing", "Food & Beverage", "Home & Garden", "Sports"]
    regions = ["North", "South", "East", "West"]
    payment_methods = ["Credit Card", "Debit Card", "Cash", "Online"]

    start_date = datetime(2025, 1, 1)

    # Price ranges by category
    price_ranges = {
        "Electronics": (29.99, 999.99),
        "Clothing": (9.99, 199.99),
        "Food & Beverage": (1.99, 49.99),
        "Home & Garden": (5.99, 299.99),
        "Sports": (14.99, 499.99),
    }

    records = []
    for i in range(n_rows):
        category = random.choice(categories)
        low, high = price_ranges[category]
        unit_price = round(random.uniform(low, high), 2)
        quantity = random.randint(1, 10)
        discount = random.choice([0, 0, 0, 0, 5, 10, 15, 20, 25]) / 100
        revenue = round(unit_price * quantity * (1 - discount), 2)

        transaction_date = start_date + timedelta(
            days=random.randint(0, 364),
            hours=random.randint(8, 22),
            minutes=random.randint(0, 59),
        )

        records.append({
            "transaction_id": f"TXN-{i + 1:06d}",
            "date": transaction_date.strftime("%Y-%m-%d"),
            "category": category,
            "region": random.choice(regions),
            "unit_price": unit_price,
            "quantity": quantity,
            "discount_pct": discount * 100,
            "revenue": revenue,
            "payment_method": random.choice(payment_methods),
            "customer_age": random.randint(18, 75),
        })

    return pd.DataFrame(records)


# ─── Data Cleaning ─────────────────────────────────────────────

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and validate the sales data."""
    initial_count = len(df)

    # Parse dates
    df["date"] = pd.to_datetime(df["date"])

    # Remove duplicates
    df = df.drop_duplicates(subset=["transaction_id"])

    # Remove negative revenues (data errors)
    df = df[df["revenue"] >= 0]

    # Cap discount at 100%
    df["discount_pct"] = df["discount_pct"].clip(0, 100)

    # Ensure quantity is positive integer
    df["quantity"] = df["quantity"].clip(lower=1).astype(int)

    # Add derived columns
    df["month"] = df["date"].dt.to_period("M")
    df["quarter"] = df["date"].dt.to_period("Q")
    df["day_of_week"] = df["date"].dt.day_name()
    df["is_weekend"] = df["date"].dt.dayofweek >= 5

    cleaned_count = len(df)
    print(f"  Cleaned: {initial_count} → {cleaned_count} rows "
          f"({initial_count - cleaned_count} removed)")

    return df.reset_index(drop=True)


# ─── Analysis ──────────────────────────────────────────────────

def analyze_data(df: pd.DataFrame) -> dict:
    """Perform comprehensive statistical analysis."""
    analysis = {}

    # Overview
    analysis["overview"] = {
        "total_transactions": len(df),
        "total_revenue": f"${df['revenue'].sum():,.2f}",
        "average_revenue": f"${df['revenue'].mean():,.2f}",
        "median_revenue": f"${df['revenue'].median():,.2f}",
        "std_revenue": f"${df['revenue'].std():,.2f}",
        "date_range": f"{df['date'].min().date()} to {df['date'].max().date()}",
    }

    # Category analysis
    cat_group = df.groupby("category").agg(
        transactions=("transaction_id", "count"),
        total_revenue=("revenue", "sum"),
        avg_revenue=("revenue", "mean"),
        avg_quantity=("quantity", "mean"),
    ).round(2).sort_values("total_revenue", ascending=False)

    analysis["by_category"] = cat_group.to_dict("index")

    # Regional analysis
    region_group = df.groupby("region").agg(
        transactions=("transaction_id", "count"),
        total_revenue=("revenue", "sum"),
        avg_revenue=("revenue", "mean"),
    ).round(2).sort_values("total_revenue", ascending=False)

    analysis["by_region"] = region_group.to_dict("index")

    # Monthly trend
    monthly = df.groupby("month").agg(
        transactions=("transaction_id", "count"),
        revenue=("revenue", "sum"),
    ).round(2)
    analysis["monthly_trend"] = {str(k): {"transactions": v["transactions"], "revenue": v["revenue"]}
                                  for k, v in monthly.iterrows()}

    # Payment method breakdown
    payment_group = df.groupby("payment_method").agg(
        transactions=("transaction_id", "count"),
        total_revenue=("revenue", "sum"),
    ).round(2)
    analysis["by_payment"] = payment_group.to_dict("index")

    # Correlation analysis
    numeric_cols = ["unit_price", "quantity", "discount_pct", "revenue", "customer_age"]
    corr_matrix = df[numeric_cols].corr().round(3)
    analysis["correlations"] = corr_matrix.to_dict()

    # Top 10 transactions
    top_10 = df.nlargest(10, "revenue")[["transaction_id", "date", "category", "revenue"]].to_dict("records")
    analysis["top_10"] = top_10

    return analysis


# ─── Visualization ─────────────────────────────────────────────

def fig_to_base64(fig) -> str:
    """Convert a Matplotlib figure to a base64-encoded PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=100, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def create_visualizations(df: pd.DataFrame) -> dict[str, str]:
    """Generate all charts and return them as base64-encoded PNG strings."""
    charts = {}
    plt.style.use("seaborn-v0_8-whitegrid")

    # 1. Revenue by Category (bar chart)
    fig, ax = plt.subplots(figsize=(10, 5))
    cat_revenue = df.groupby("category")["revenue"].sum().sort_values()
    cat_revenue.plot(kind="barh", ax=ax, color="#3498db")
    ax.set_xlabel("Total Revenue ($)")
    ax.set_title("Revenue by Category")
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x:,.0f}"))
    charts["category_revenue"] = fig_to_base64(fig)

    # 2. Monthly Revenue Trend (line chart)
    fig, ax = plt.subplots(figsize=(12, 5))
    monthly = df.groupby(df["date"].dt.to_period("M"))["revenue"].sum()
    monthly.index = monthly.index.to_timestamp()
    ax.plot(monthly.index, monthly.values, marker="o", linewidth=2, color="#e74c3c")
    ax.fill_between(monthly.index, monthly.values, alpha=0.1, color="#e74c3c")
    ax.set_ylabel("Revenue ($)")
    ax.set_title("Monthly Revenue Trend")
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x:,.0f}"))
    plt.xticks(rotation=45)
    charts["monthly_trend"] = fig_to_base64(fig)

    # 3. Revenue Distribution (histogram)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(df["revenue"], bins=40, color="#2ecc71", edgecolor="white", alpha=0.8)
    ax.set_xlabel("Revenue ($)")
    ax.set_ylabel("Frequency")
    ax.set_title("Revenue Distribution")
    ax.axvline(df["revenue"].mean(), color="red", linestyle="--", label=f"Mean: ${df['revenue'].mean():.2f}")
    ax.axvline(df["revenue"].median(), color="blue", linestyle="--", label=f"Median: ${df['revenue'].median():.2f}")
    ax.legend()
    charts["revenue_dist"] = fig_to_base64(fig)

    # 4. Region Comparison (pie chart)
    fig, ax = plt.subplots(figsize=(8, 8))
    region_revenue = df.groupby("region")["revenue"].sum()
    colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"]
    wedges, texts, autotexts = ax.pie(
        region_revenue, labels=region_revenue.index, autopct="%1.1f%%",
        colors=colors, startangle=90, textprops={"fontsize": 12},
    )
    ax.set_title("Revenue by Region")
    charts["region_pie"] = fig_to_base64(fig)

    # 5. Payment Method Breakdown (horizontal bar)
    fig, ax = plt.subplots(figsize=(8, 4))
    payment_counts = df["payment_method"].value_counts()
    payment_counts.plot(kind="barh", ax=ax, color="#9b59b6")
    ax.set_xlabel("Number of Transactions")
    ax.set_title("Transactions by Payment Method")
    charts["payment_bar"] = fig_to_base64(fig)

    # 6. Correlation Heatmap
    fig, ax = plt.subplots(figsize=(8, 6))
    numeric_cols = ["unit_price", "quantity", "discount_pct", "revenue", "customer_age"]
    corr = df[numeric_cols].corr()
    im = ax.imshow(corr, cmap="RdYlBu_r", vmin=-1, vmax=1)
    ax.set_xticks(range(len(numeric_cols)))
    ax.set_yticks(range(len(numeric_cols)))
    ax.set_xticklabels(numeric_cols, rotation=45, ha="right")
    ax.set_yticklabels(numeric_cols)
    for i in range(len(numeric_cols)):
        for j in range(len(numeric_cols)):
            ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", fontsize=9)
    fig.colorbar(im, ax=ax, shrink=0.8)
    ax.set_title("Correlation Heatmap")
    charts["heatmap"] = fig_to_base64(fig)

    return charts


# ─── HTML Report Generation ───────────────────────────────────

REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Data Analysis Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; color: #333; background: #f5f6fa;
        }
        .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #2c3e50, #3498db);
            color: white; padding: 40px 0; text-align: center;
        }
        header h1 { font-size: 2.5em; margin-bottom: 10px; }
        header p { font-size: 1.1em; opacity: 0.9; }
        .card {
            background: white; border-radius: 12px; padding: 30px;
            margin: 20px 0; box-shadow: 0 2px 15px rgba(0,0,0,0.08);
        }
        .card h2 {
            color: #2c3e50; margin-bottom: 20px; padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }
        .stat-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .stat-item {
            text-align: center; padding: 20px; background: #f8f9fa;
            border-radius: 8px;
        }
        .stat-value { font-size: 1.8em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; font-size: 0.9em; margin-top: 5px; }
        .chart { text-align: center; margin: 20px 0; }
        .chart img { max-width: 100%; border-radius: 8px; }
        table {
            width: 100%; border-collapse: collapse; margin: 15px 0;
        }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ecf0f1; }
        th { background: #2c3e50; color: white; font-weight: 600; }
        tr:hover { background: #f8f9fa; }
        footer {
            text-align: center; padding: 30px; color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <header>
        <h1>📊 Sales Data Analysis Report</h1>
        <p>Generated on {{ generated_at }} • {{ total_rows }} transactions analyzed</p>
    </header>

    <div class="container">
        <!-- Overview -->
        <div class="card">
            <h2>📈 Overview</h2>
            <div class="stat-grid">
                {% for key, value in overview.items() %}
                <div class="stat-item">
                    <div class="stat-value">{{ value }}</div>
                    <div class="stat-label">{{ key | replace('_', ' ') | title }}</div>
                </div>
                {% endfor %}
            </div>
        </div>

        <!-- Revenue by Category -->
        <div class="card">
            <h2>💰 Revenue by Category</h2>
            <div class="chart">
                <img src="data:image/png;base64,{{ charts.category_revenue }}" alt="Revenue by Category">
            </div>
            <table>
                <tr><th>Category</th><th>Transactions</th><th>Total Revenue</th><th>Avg Revenue</th></tr>
                {% for cat, data in by_category.items() %}
                <tr>
                    <td>{{ cat }}</td>
                    <td>{{ data.transactions }}</td>
                    <td>${{ "{:,.2f}".format(data.total_revenue) }}</td>
                    <td>${{ "{:,.2f}".format(data.avg_revenue) }}</td>
                </tr>
                {% endfor %}
            </table>
        </div>

        <!-- Monthly Trend -->
        <div class="card">
            <h2>📅 Monthly Revenue Trend</h2>
            <div class="chart">
                <img src="data:image/png;base64,{{ charts.monthly_trend }}" alt="Monthly Trend">
            </div>
        </div>

        <!-- Revenue Distribution -->
        <div class="card">
            <h2>📊 Revenue Distribution</h2>
            <div class="chart">
                <img src="data:image/png;base64,{{ charts.revenue_dist }}" alt="Revenue Distribution">
            </div>
        </div>

        <!-- Regional Analysis -->
        <div class="card">
            <h2>🌍 Regional Analysis</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div class="chart" style="flex: 1; min-width: 300px;">
                    <img src="data:image/png;base64,{{ charts.region_pie }}" alt="Revenue by Region">
                </div>
                <div style="flex: 1;">
                    <table>
                        <tr><th>Region</th><th>Transactions</th><th>Revenue</th></tr>
                        {% for region, data in by_region.items() %}
                        <tr>
                            <td>{{ region }}</td>
                            <td>{{ data.transactions }}</td>
                            <td>${{ "{:,.2f}".format(data.total_revenue) }}</td>
                        </tr>
                        {% endfor %}
                    </table>
                </div>
            </div>
        </div>

        <!-- Payment Methods -->
        <div class="card">
            <h2>💳 Payment Methods</h2>
            <div class="chart">
                <img src="data:image/png;base64,{{ charts.payment_bar }}" alt="Payment Methods">
            </div>
        </div>

        <!-- Correlations -->
        <div class="card">
            <h2>🔗 Correlation Analysis</h2>
            <div class="chart">
                <img src="data:image/png;base64,{{ charts.heatmap }}" alt="Correlation Heatmap">
            </div>
        </div>

        <!-- Top 10 -->
        <div class="card">
            <h2>🏆 Top 10 Transactions</h2>
            <table>
                <tr><th>Transaction ID</th><th>Date</th><th>Category</th><th>Revenue</th></tr>
                {% for txn in top_10 %}
                <tr>
                    <td>{{ txn.transaction_id }}</td>
                    <td>{{ txn.date }}</td>
                    <td>{{ txn.category }}</td>
                    <td>${{ "{:,.2f}".format(txn.revenue) }}</td>
                </tr>
                {% endfor %}
            </table>
        </div>
    </div>

    <footer>
        <p>Generated by Data Analysis Dashboard • Python Mastery Chapter 14</p>
    </footer>
</body>
</html>
"""


def generate_report(analysis: dict, charts: dict[str, str], output_path: Path, total_rows: int) -> None:
    """Render the HTML report from analysis data and charts."""
    template = Template(REPORT_TEMPLATE)
    html = template.render(
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        total_rows=total_rows,
        overview=analysis["overview"],
        by_category=analysis["by_category"],
        by_region=analysis["by_region"],
        charts=charts,
        top_10=analysis["top_10"],
    )
    output_path.write_text(html)
    print(f"\n  ✓ Report saved to: {output_path}")


# ─── Main Pipeline ─────────────────────────────────────────────

def run_pipeline(input_file: Optional[str] = None, output_file: str = "report.html") -> None:
    """Execute the full data analysis pipeline."""
    output_path = Path(output_file)

    # Step 1: Load or generate data
    print("\n[1/5] Loading data...")
    if input_file:
        print(f"  Reading from {input_file}")
        df = pd.read_csv(input_file)
    else:
        print("  Generating 1000 sample transactions...")
        df = generate_sales_data(1000)
        # Save raw data for reference
        df.to_csv("sample_sales_data.csv", index=False)
        print("  Saved raw data to sample_sales_data.csv")

    print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

    # Step 2: Clean data
    print("\n[2/5] Cleaning data...")
    df = clean_data(df)

    # Step 3: Analyze
    print("\n[3/5] Analyzing...")
    analysis = analyze_data(df)
    print(f"  Computed statistics across {len(analysis)} dimensions")

    # Step 4: Visualize
    print("\n[4/5] Generating charts...")
    charts = create_visualizations(df)
    print(f"  Created {len(charts)} visualizations")

    # Step 5: Generate report
    print("\n[5/5] Generating report...")
    generate_report(analysis, charts, output_path, total_rows=len(df))

    # Print summary
    print("\n" + "=" * 50)
    print("  ANALYSIS COMPLETE")
    print("=" * 50)
    for key, value in analysis["overview"].items():
        print(f"  {key:>24}: {value}")
    print("=" * 50 + "\n")


# ─── CLI ───────────────────────────────────────────────────────

def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Data Analysis Dashboard")
    parser.add_argument("--input", "-i", default=None, help="Input CSV file (generates sample data if omitted)")
    parser.add_argument("--output", "-o", default="report.html", help="Output HTML report path")
    parser.add_argument("--rows", type=int, default=1000, help="Number of rows to generate (if no input file)")
    args = parser.parse_args()

    run_pipeline(input_file=args.input, output_file=args.output)


if __name__ == "__main__":
    main()
```

### 14.4.4 How to Run

```bash
# Generate sample data and create report
python data_dashboard.py

# Use your own CSV
python data_dashboard.py --input your_data.csv --output analysis.html

# Specify number of generated rows
python data_dashboard.py --rows 5000
```

The output `report.html` is a self-contained file you can open in any browser — all charts are embedded as base64 images.

### 14.4.5 Ideas for Extending

- Add **interactive charts** with Plotly instead of static Matplotlib images
- Support **multiple data sources** (databases, APIs, Excel files)
- Add **outlier detection** and **anomaly flagging**
- Implement **year-over-year comparison** analysis
- Add **forecasting** with simple time-series models

---
---

## 14.5 Project 5: Chat Application with WebSockets

### 14.5.1 Overview

A real-time chat application with room-based messaging, user nicknames, online user tracking, and message history. The backend is built with FastAPI and WebSockets; the frontend is a clean HTML/CSS/JS interface served directly from the Python server.

**Features:**

- Real-time bidirectional communication via WebSockets
- Multiple chat rooms
- User nicknames with online tracking
- Message history (stored in SQLite)
- Auto-scroll and typing indicators
- Responsive web interface
- No external JavaScript frameworks — pure vanilla JS

### 14.5.2 Architecture

```
┌──────────────────────────────────────────────────────┐
│                 Browser (HTML/CSS/JS)                 │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Room List   │  │ Message Area │  │ User List    │ │
│  │ (sidebar)   │  │ (main)       │  │ (right)      │ │
│  └──────┬─────┘  └──────┬───────┘  └──────────────┘ │
│         │                │                            │
│         └─────── WebSocket Connection ───────────────┘
└──────────────────────┬───────────────────────────────┘
                       │ ws://
┌──────────────────────▼───────────────────────────────┐
│              FastAPI + WebSocket Server                │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │            ConnectionManager                   │    │
│  │  • connect(websocket, room, nickname)         │    │
│  │  • disconnect(websocket)                      │    │
│  │  • broadcast(room, message)                   │    │
│  └──────────────────────┬───────────────────────┘    │
│                         │                             │
│  ┌──────────┐  ┌───────▼─────────────────────────┐  │
│  │ REST API │  │   WebSocket Endpoint             │  │
│  │ GET      │  │   /ws/{room}?nickname=xxx        │  │
│  │ /rooms   │  │   • join room                    │  │
│  │ /history │  │   • receive messages              │  │
│  └──────────┘  │   • leave room                    │  │
│                 └──────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              SQLite (chat.db)                         │
│  messages: id, room, nickname, content, timestamp     │
└─────────────────────────────────────────────────────┘
```

### 14.5.3 Implementation

Create `chat_app/` directory:

**`chat_app/server.py`** — The complete server:

```python
#!/usr/bin/env python3
"""Real-time Chat Application with WebSockets."""

import asyncio
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse

app = FastAPI(title="Chat Application")
DB_PATH = Path("chat.db")

# ─── Database ──────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            room      TEXT    NOT NULL,
            nickname  TEXT    NOT NULL,
            content   TEXT    NOT NULL,
            timestamp TEXT    NOT NULL
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_messages_room ON messages (room, timestamp)")
    conn.commit()
    conn.close()


def save_message(room: str, nickname: str, content: str) -> None:
    conn = get_db()
    conn.execute(
        "INSERT INTO messages (room, nickname, content, timestamp) VALUES (?, ?, ?, ?)",
        (room, nickname, content, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def get_history(room: str, limit: int = 50) -> list[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM messages WHERE room = ? ORDER BY timestamp DESC LIMIT ?",
        (room, limit),
    ).fetchall()
    conn.close()
    return [dict(row) for row in reversed(rows)]


def get_all_rooms() -> list[str]:
    conn = get_db()
    rows = conn.execute("SELECT DISTINCT room FROM messages ORDER BY room").fetchall()
    conn.close()
    return [row["room"] for row in rows]


# ─── Connection Manager ────────────────────────────────────────

class ConnectionManager:
    """Manages WebSocket connections across rooms."""

    def __init__(self) -> None:
        # room -> {websocket: nickname}
        self.active_connections: dict[str, dict[WebSocket, str]] = {}

    async def connect(self, websocket: WebSocket, room: str, nickname: str) -> None:
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = {}
        self.active_connections[room][websocket] = nickname

        # Notify room about new user
        await self.broadcast(room, {
            "type": "system",
            "content": f"{nickname} joined the room",
            "nickname": "System",
            "timestamp": datetime.now().isoformat(),
        })
        # Send updated user list
        await self._broadcast_user_list(room)

    async def disconnect(self, websocket: WebSocket, room: str) -> None:
        if room in self.active_connections:
            nickname = self.active_connections[room].pop(websocket, None)
            if not self.active_connections[room]:
                del self.active_connections[room]
            elif nickname:
                await self.broadcast(room, {
                    "type": "system",
                    "content": f"{nickname} left the room",
                    "nickname": "System",
                    "timestamp": datetime.now().isoformat(),
                })
                await self._broadcast_user_list(room)

    async def broadcast(self, room: str, message: dict) -> None:
        if room not in self.active_connections:
            return
        disconnected = []
        for ws in self.active_connections[room]:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            await self.disconnect(ws, room)

    async def _broadcast_user_list(self, room: str) -> None:
        if room in self.active_connections:
            users = list(self.active_connections[room].values())
            await self.broadcast(room, {
                "type": "user_list",
                "users": users,
                "count": len(users),
            })

    def get_users(self, room: str) -> list[str]:
        if room in self.active_connections:
            return list(self.active_connections[room].values())
        return []


manager = ConnectionManager()

# ─── HTML Frontend ─────────────────────────────────────────────

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        /* ─── Join Screen ─── */
        #join-screen {
            display: flex; justify-content: center; align-items: center;
            height: 100vh; background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .join-box {
            background: white; padding: 40px; border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;
            width: 380px;
        }
        .join-box h1 { color: #333; margin-bottom: 8px; font-size: 1.8em; }
        .join-box p { color: #888; margin-bottom: 25px; }
        .join-box input, .join-box select {
            width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0;
            border-radius: 8px; font-size: 16px; margin-bottom: 15px;
            transition: border-color 0.3s;
        }
        .join-box input:focus, .join-box select:focus { outline: none; border-color: #667eea; }
        .join-box button {
            width: 100%; padding: 14px; background: #667eea; color: white;
            border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
            font-weight: 600; transition: background 0.3s;
        }
        .join-box button:hover { background: #5a6fd6; }

        /* ─── Chat Screen ─── */
        #chat-screen { display: none; height: 100vh; }
        .chat-container {
            display: flex; height: 100%;
        }

        /* Sidebar */
        .sidebar {
            width: 220px; background: #2c3e50; color: white;
            display: flex; flex-direction: column;
        }
        .sidebar-header {
            padding: 20px; background: #34495e; text-align: center;
            font-weight: bold; font-size: 1.1em;
        }
        .room-list { flex: 1; overflow-y: auto; padding: 10px 0; }
        .room-item {
            padding: 12px 20px; cursor: pointer; transition: background 0.2s;
            display: flex; align-items: center; gap: 8px;
        }
        .room-item:hover { background: #34495e; }
        .room-item.active { background: #3498db; }
        .room-item::before { content: "#"; opacity: 0.5; }

        /* Main Chat */
        .main-chat { flex: 1; display: flex; flex-direction: column; }
        .chat-header {
            padding: 15px 20px; background: white; border-bottom: 1px solid #e0e0e0;
            display: flex; justify-content: space-between; align-items: center;
        }
        .chat-header h2 { color: #333; }
        .chat-header .online-count { color: #27ae60; font-size: 0.9em; }

        .messages {
            flex: 1; overflow-y: auto; padding: 20px;
            background: #f8f9fa;
        }
        .message {
            margin-bottom: 12px; max-width: 70%;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }
        .message.own { margin-left: auto; }
        .message-header {
            font-size: 0.8em; color: #888; margin-bottom: 3px;
            display: flex; gap: 8px; align-items: center;
        }
        .message.own .message-header { justify-content: flex-end; }
        .message-bubble {
            padding: 10px 14px; border-radius: 12px;
            word-wrap: break-word; line-height: 1.4;
        }
        .message:not(.own) .message-bubble {
            background: white; border: 1px solid #e0e0e0; border-bottom-left-radius: 4px;
        }
        .message.own .message-bubble {
            background: #3498db; color: white; border-bottom-right-radius: 4px;
        }
        .message.system { max-width: 100%; text-align: center; }
        .message.system .message-bubble {
            background: transparent; color: #aaa; font-style: italic;
            border: none; font-size: 0.85em;
        }

        .input-area {
            padding: 15px 20px; background: white;
            border-top: 1px solid #e0e0e0;
            display: flex; gap: 10px;
        }
        .input-area input {
            flex: 1; padding: 12px 16px; border: 2px solid #e0e0e0;
            border-radius: 25px; font-size: 15px; transition: border-color 0.3s;
        }
        .input-area input:focus { outline: none; border-color: #3498db; }
        .input-area button {
            padding: 12px 24px; background: #3498db; color: white;
            border: none; border-radius: 25px; cursor: pointer;
            font-weight: 600; transition: background 0.3s;
        }
        .input-area button:hover { background: #2980b9; }

        /* Users Panel */
        .users-panel {
            width: 180px; background: white; border-left: 1px solid #e0e0e0;
            display: flex; flex-direction: column;
        }
        .users-header {
            padding: 15px; border-bottom: 1px solid #e0e0e0;
            font-weight: 600; color: #333;
        }
        .user-list { flex: 1; overflow-y: auto; padding: 10px; }
        .user-item {
            padding: 8px 12px; color: #555; font-size: 0.9em;
            display: flex; align-items: center; gap: 8px;
        }
        .user-item::before {
            content: ""; width: 8px; height: 8px; border-radius: 50%;
            background: #27ae60; display: inline-block;
        }
    </style>
</head>
<body>
    <!-- Join Screen -->
    <div id="join-screen">
        <div class="join-box">
            <h1>💬 Python Chat</h1>
            <p>Join a room and start chatting</p>
            <input type="text" id="nickname" placeholder="Your nickname" maxlength="20" autofocus>
            <select id="room-select">
                <option value="general"># general</option>
                <option value="random"># random</option>
                <option value="tech"># tech</option>
                <option value="off-topic"># off-topic</option>
            </select>
            <input type="text" id="custom-room" placeholder="Or create a new room...">
            <button onclick="joinChat()">Join Chat</button>
        </div>
    </div>

    <!-- Chat Screen -->
    <div id="chat-screen">
        <div class="chat-container">
            <div class="sidebar">
                <div class="sidebar-header">💬 Rooms</div>
                <div class="room-list" id="room-list"></div>
            </div>
            <div class="main-chat">
                <div class="chat-header">
                    <h2 id="room-name"># general</h2>
                    <span class="online-count" id="online-count">0 online</span>
                </div>
                <div class="messages" id="messages"></div>
                <div class="input-area">
                    <input type="text" id="message-input" placeholder="Type a message..."
                           onkeypress="if(event.key==='Enter') sendMessage()">
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
            <div class="users-panel">
                <div class="users-header">👥 Online</div>
                <div class="user-list" id="user-list"></div>
            </div>
        </div>
    </div>

    <script>
        let ws;
        let currentRoom = "general";
        let myNickname = "";
        const rooms = ["general", "random", "tech", "off-topic"];

        function joinChat() {
            myNickname = document.getElementById("nickname").value.trim();
            const customRoom = document.getElementById("custom-room").value.trim();
            const selectRoom = document.getElementById("room-select").value;
            currentRoom = customRoom || selectRoom;

            if (!myNickname) { alert("Please enter a nickname"); return; }

            document.getElementById("join-screen").style.display = "none";
            document.getElementById("chat-screen").style.display = "block";

            if (!rooms.includes(currentRoom)) rooms.push(currentRoom);
            renderRooms();
            connectWebSocket(currentRoom);
        }

        function renderRooms() {
            const list = document.getElementById("room-list");
            list.innerHTML = rooms.map(r =>
                `<div class="room-item ${r === currentRoom ? 'active' : ''}"
                      onclick="switchRoom('${r}')">${r}</div>`
            ).join("");
        }

        function switchRoom(room) {
            if (ws) ws.close();
            currentRoom = room;
            document.getElementById("messages").innerHTML = "";
            document.getElementById("room-name").textContent = "# " + room;
            renderRooms();
            connectWebSocket(room);
        }

        function connectWebSocket(room) {
            const protocol = location.protocol === "https:" ? "wss:" : "ws:";
            ws = new WebSocket(`${protocol}//${location.host}/ws/${room}?nickname=${encodeURIComponent(myNickname)}`);

            ws.onopen = () => {
                // Load history
                fetch(`/history/${room}`)
                    .then(r => r.json())
                    .then(msgs => msgs.forEach(m => addMessage(m, false)));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "user_list") {
                    updateUserList(data.users, data.count);
                } else {
                    addMessage(data);
                }
            };

            ws.onclose = () => console.log("Disconnected from", room);
        }

        function sendMessage() {
            const input = document.getElementById("message-input");
            const content = input.value.trim();
            if (!content || !ws || ws.readyState !== WebSocket.OPEN) return;
            ws.send(JSON.stringify({ type: "message", content }));
            input.value = "";
            input.focus();
        }

        function addMessage(data, scroll = true) {
            const container = document.getElementById("messages");
            const div = document.createElement("div");
            const isOwn = data.nickname === myNickname;
            const isSystem = data.type === "system";

            div.className = `message ${isSystem ? 'system' : ''} ${isOwn ? 'own' : ''}`;

            if (isSystem) {
                div.innerHTML = `<div class="message-bubble">${data.content}</div>`;
            } else {
                const time = new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                div.innerHTML = `
                    <div class="message-header">
                        <strong>${data.nickname}</strong>
                        <span>${time}</span>
                    </div>
                    <div class="message-bubble">${escapeHtml(data.content)}</div>
                `;
            }

            container.appendChild(div);
            if (scroll) container.scrollTop = container.scrollHeight;
        }

        function updateUserList(users, count) {
            document.getElementById("online-count").textContent = `${count} online`;
            document.getElementById("user-list").innerHTML = users.map(u =>
                `<div class="user-item">${escapeHtml(u)}</div>`
            ).join("");
        }

        function escapeHtml(text) {
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }

        // Allow Enter to join
        document.getElementById("nickname").addEventListener("keypress", (e) => {
            if (e.key === "Enter") joinChat();
        });
    </script>
</body>
</html>
"""

# ─── Routes ────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    """Serve the chat interface."""
    return HTML_PAGE


@app.get("/rooms")
async def list_rooms() -> dict:
    """List all rooms with messages."""
    return {"rooms": get_all_rooms()}


@app.get("/history/{room}")
async def history(room: str, limit: int = Query(50, ge=1, le=200)) -> list[dict]:
    """Get message history for a room."""
    return get_history(room, limit)


@app.get("/users/{room}")
async def users(room: str) -> dict:
    """Get online users in a room."""
    return {"room": room, "users": manager.get_users(room)}


@app.websocket("/ws/{room}")
async def websocket_endpoint(
    websocket: WebSocket,
    room: str,
    nickname: str = Query(...),
) -> None:
    """WebSocket endpoint for real-time chat."""
    await manager.connect(websocket, room, nickname)
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "message" and data.get("content"):
                content = data["content"].strip()
                if not content:
                    continue

                # Save to database
                save_message(room, nickname, content)

                # Broadcast to room
                await manager.broadcast(room, {
                    "type": "message",
                    "nickname": nickname,
                    "content": content,
                    "timestamp": datetime.now().isoformat(),
                })

    except WebSocketDisconnect:
        await manager.disconnect(websocket, room)
    except Exception:
        await manager.disconnect(websocket, room)


@app.on_event("startup")
def startup() -> None:
    init_db()


# ─── Entry Point ───────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)
```

### 14.5.4 How to Run

```bash
# Start the server
python -m chat_app.server

# Open multiple browser tabs at:
# http://127.0.0.1:8765

# Enter different nicknames and join rooms to see real-time chat
```

### 14.5.5 Ideas for Extending

- Add **private messaging** between users
- Implement **file/image sharing** in chat
- Add **emoji picker** and message reactions
- Build **admin controls** (kick, ban, mute)
- Add **typing indicators** (show "user is typing...")
- Implement **message search** across history
- Add **WebSocket reconnection** logic on the client

---
---

## Final Summary

You've reached the end of **Python Mastery** — and what an end it is. Over fourteen chapters, you've built a complete, production-quality skill set in Python, from printing your first line of code to deploying real-time WebSocket applications.

### The Journey

| Chapter | Topic | What You Learned |
|---------|-------|------------------|
| **1** | Introduction | Python's philosophy, history, and why it dominates modern development |
| **2** | Fundamentals | Variables, types, operators, and string manipulation |
| **3** | Control Flow | `if`/`elif`/`else`, `for`/`while` loops, `match`/`case` |
| **4** | Functions | Scope, closures, decorators, generators, and higher-order functions |
| **5** | Data Structures | Lists, tuples, sets, dicts, and comprehensions |
| **6** | OOP | Classes, inheritance, protocols, dataclasses, and design patterns |
| **7** | File I/O | Reading/writing files, JSON, CSV, pathlib, and context managers |
| **8** | Error Handling & Testing | Exceptions, `try`/`except`, pytest, fixtures, and test coverage |
| **9** | Modules & Packages | Imports, `__init__.py`, virtual environments, and project structure |
| **10** | Advanced Topics | Decorators, metaclasses, descriptors, and the data model |
| **11** | Concurrency | Threading, multiprocessing, `async`/`await`, and async iteration |
| **12** | Networking & APIs | Sockets, HTTP clients, REST APIs, and WebSocket basics |
| **13** | Database Programming | SQL fundamentals, SQLite, SQLAlchemy ORM, and migrations |
| **14** | Hands-On Projects | Five complete, real-world applications from scratch |

### Skills You've Built

Through the five projects in this chapter, you demonstrated proficiency across the full Python stack:

- **Project 1** — CLI application design with Click, SQLite, data validation, and CSV export
- **Project 2** — Web scraping with requests/BeautifulSoup, retry logic, email alerts, and scheduling
- **Project 3** — REST API with FastAPI, JWT authentication, SQLAlchemy ORM, Pydantic validation, and testing
- **Project 4** — Data analysis pipeline with Pandas, Matplotlib, statistical analysis, and HTML report generation
- **Project 5** — Real-time WebSocket chat with bidirectional communication, room management, and a complete frontend

Each project was self-contained, runnable, and built on the foundations from earlier chapters.

### What Makes a Great Python Developer

Technical skills are necessary but not sufficient. As you continue growing, focus on these principles:

1. **Readability counts.** Write code that your teammates can understand at a glance. Use meaningful names, keep functions short, and document your design decisions.

2. **Embrace the ecosystem.** Python's strength is its community. Learn to find, evaluate, and use third-party packages. Read source code of libraries you admire.

3. **Test relentlessly.** The projects in this chapter included tests because testing isn't optional — it's what separates hobby code from production code. Aim for comprehensive coverage.

4. **Iterate, don't perfect.** Ship a working version, then improve it. The best Python developers iterate quickly and learn from real usage.

5. **Stay current.** Python evolves rapidly. Follow PEPs, read release notes, and experiment with new features. The language you learned in this book will keep growing.

### Where to Go Next

The Python ecosystem is vast. Here are natural next steps based on your interests:

| Interest | Recommended Path |
|----------|-----------------|
| **Web Development** | Django, Flask, or FastAPI in production with PostgreSQL |
| **Data Science** | NumPy, SciPy, scikit-learn, and Jupyter notebooks |
| **Machine Learning** | PyTorch, TensorFlow, or Hugging Face Transformers |
| **DevOps & Automation** | Ansible, Docker SDK, Terraform, and CI/CD pipelines |
| **Systems Programming** | Rust extensions via PyO3, or pure Rust with maturin |
| **Open Source** | Find a project on GitHub that excites you and start contributing |

### A Final Thought

The best way to learn Python is to **build things that solve real problems**. Every script you write, every API you deploy, every dataset you analyze makes you a stronger developer. This book gave you the foundation — now the journey is yours to continue.

Write code. Break things. Fix them. Repeat.

**Happy coding.** 🐍
