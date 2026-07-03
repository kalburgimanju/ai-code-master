# Chapter 12: Data Science & Machine Learning

> *"Data science is not about the tools — it's about asking the right questions and letting the data tell the story."*

Python has become the lingua franca of data science. From financial firms running fraud detection models to hospitals predicting patient outcomes, Python's ecosystem of libraries — NumPy, Pandas, Matplotlib, scikit-learn — powers the world's most critical analytical workflows. This chapter takes you from zero to a working understanding of the entire data science pipeline: manipulating numerical data with NumPy, wrangling tabular data with Pandas, visualizing insights with Matplotlib, and building predictive models with scikit-learn.

---

## 12.1 The Data Science Landscape

### 12.1.1 What Is Data Science?

Data science is the practice of extracting knowledge and actionable insights from structured and unstructured data. It sits at the intersection of three disciplines:

- **Statistics** — the mathematical foundation for inference and uncertainty
- **Computer Science** — algorithms, programming, and systems engineering
- **Domain Expertise** — understanding the business or scientific context

A data scientist doesn't just write code — they formulate hypotheses, design experiments, build models, and communicate findings to stakeholders who can act on them.

### 12.1.2 The Data Science Pipeline

Every data science project follows a roughly sequential pipeline:

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  1. Define   │───▶│ 2. Collect  │───▶│ 3. Clean &   │───▶│ 4. Explore  │
│  Question    │    │    Data     │    │  Preprocess  │    │   (EDA)     │
└─────────────┘    └─────────────┘    └──────────────┘    └──────┬──────┘
                                                                 │
┌─────────────┐    ┌─────────────┐    ┌──────────────┐           │
│  7. Deploy   │◀──│ 6. Communicate◀──│ 5. Model &   │◀──────────┘
│  & Monitor   │    │  Results     │    │  Evaluate    │
└─────────────┘    └─────────────┘    └──────────────┘
```

Each stage feeds the next. In practice, the pipeline is *iterative* — you'll revisit earlier stages as you learn more from the data.

### 12.1.3 Tools and Libraries Overview

| Library | Purpose | Typical Use |
|---------|---------|-------------|
| **NumPy** | Numerical computing | Array operations, linear algebra, randomness |
| **Pandas** | Data manipulation | Tabular data, cleaning, aggregation |
| **Matplotlib** | Data visualization | Line plots, bar charts, histograms |
| **Seaborn** | Statistical visualization | Heatmaps, box plots, pair plots |
| **scikit-learn** | Machine learning | Classification, regression, clustering |
| **SciPy** | Scientific computing | Optimization, statistics, signal processing |
| **Statsmodels** | Statistical modeling | Hypothesis testing, time series, regression |
| **Jupyter** | Interactive computing | Notebooks for exploration and reporting |

### 12.1.4 Jupyter Notebooks Basics

Jupyter Notebooks are the de facto environment for interactive data science. Each notebook is a sequence of *cells* that can contain code, markdown text, or raw output.

```bash
# Install Jupyter
pip install jupyterlab

# Launch the notebook server
jupyter lab
```

Key concepts:

- **Code cells** — execute Python code and display output inline
- **Markdown cells** — write documentation with rich formatting
- **Kernel** — the Python process executing your code; restart it to clear state
- **Magic commands** — special IPython commands prefixed with `%` (line) or `%%` (cell)

```python
# Useful magic commands
%timeit sum(range(1_000_000))     # benchmark a single line
%%timeit                          # benchmark an entire cell
result = []
for i in range(1_000_000):
    result.append(i * 2)
%matplotlib inline                 # show plots inline in the notebook
%who                               # list all variables in scope
```

### 12.1.5 Setting Up a Data Science Environment

The recommended approach is to create an isolated virtual environment:

```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows

# Install the core data science stack
pip install numpy pandas matplotlib seaborn scikit-learn jupyterlab

# Optional: pin versions for reproducibility
pip freeze > requirements.txt
```

For reproducible environments, consider using `conda` or `mamba` instead, especially when dealing with compiled dependencies like BLAS or HDF5.

---

## 12.2 NumPy Fundamentals

NumPy (Numerical Python) is the foundation of the entire Python data science stack. It provides the `ndarray` — a fast, memory-efficient multidimensional array that supports vectorized operations.

### 12.2.1 Creating Arrays

```python
import numpy as np

# From Python lists
arr = np.array([1, 2, 3, 4, 5])            # 1D array
matrix = np.array([[1, 2, 3],               # 2D array
                   [4, 5, 6]])

# Common constructors
zeros = np.zeros((3, 4))                     # 3x4 matrix of 0s
ones = np.ones((2, 3, 4))                    # 3D array of 1s
empty = np.empty((2, 2))                     # uninitialized (garbage values)
identity = np.eye(4)                         # 4x4 identity matrix
diagonal = np.diag([1, 2, 3])               # 3x3 diagonal matrix

# Sequences
range_array = np.arange(0, 10, 2)           # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)             # [0.0, 0.25, 0.5, 0.75, 1.0]
logspace = np.logspace(0, 3, 4)             # [1, 10, 100, 1000]

# Random numbers
rng = np.random.default_rng(seed=42)        # recommended Generator API
uniform = rng.uniform(0, 1, size=(3, 3))    # 3x3 uniform [0, 1)
normal = rng.normal(loc=0, scale=1, size=1000)  # standard normal
ints = rng.integers(0, 100, size=5)         # random ints in [0, 100)
```

### 12.2.2 Indexing and Slicing

NumPy indexing is zero-based and supports slicing just like Python lists, but extends to multiple dimensions:

```python
arr = np.array([10, 20, 30, 40, 50])

arr[0]           # 10
arr[-1]          # 50
arr[1:4]         # array([20, 30, 40])
arr[::2]         # array([10, 30, 50]) — every other element

matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

matrix[0, :]     # array([1, 2, 3])    — first row
matrix[:, 1]     # array([2, 5, 8])    — second column
matrix[0:2, 1:]  # array([[2, 3],
                 #        [5, 6]])     — sub-matrix
```

### 12.2.3 Shape Manipulation

```python
arr = np.arange(12)

# Reshape
arr.reshape(3, 4)          # 3 rows, 4 columns
arr.reshape(4, 3)          # 4 rows, 3 columns
arr.reshape(2, 3, 2)       # 3D: 2 blocks of 3x2
arr.reshape(-1, 4)         # auto-calculate rows: 3x4
arr.reshape(3, -1)         # auto-calculate cols: 3x4

# Transpose
matrix = arr.reshape(3, 4)
matrix.T                   # 4x3 — swap rows and columns
matrix.transpose(1, 0)     # same as .T for 2D

# Flatten and ravel
matrix.ravel()             # 1D view (changes propagate)
matrix.flatten()           # 1D copy (independent of original)

# Expand dimensions
vec = np.array([1, 2, 3])
vec.reshape(3, 1)          # column vector (3, 1)
vec[np.newaxis, :]         # row vector (1, 3)
```

### 12.2.4 Mathematical Operations

NumPy's power is vectorized operations — element-wise math without explicit loops:

```python
a = np.array([1, 2, 3, 4, 5], dtype=float)

# Element-wise operations
a + 10          # array([11., 12., 13., 14., 15.])
a * 2           # array([ 2.,  4.,  6.,  8., 10.])
a ** 2          # array([ 1.,  4.,  9., 16., 25.])
np.sqrt(a)      # array([1.0, 1.414, 1.732, 2.0, 2.236])
np.exp(a)       # exponential
np.log(a)       # natural log

# Aggregations
np.sum(a)       # 15
np.mean(a)      # 3.0
np.std(a)       # 1.414 (population std)
np.var(a)       # 2.0 (variance)
np.min(a)       # 1
np.max(a)       # 5
np.argmin(a)    # 0 (index of min)
np.argmax(a)    # 4 (index of max)

# Linear algebra
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

A @ B           # matrix multiplication: array([[19, 22], [43, 50]])
np.dot(A, B)    # same result
np.linalg.inv(A)          # inverse
np.linalg.det(A)          # determinant: -2.0
np.linalg.eig(A)          # eigenvalues and eigenvectors
np.linalg.norm(A)         # Frobenius norm
```

### 12.2.5 Boolean Indexing and Masking

Boolean arrays let you select elements based on conditions:

```python
arr = np.array([10, 25, 30, 15, 40, 5])

# Create a boolean mask
mask = arr > 20           # array([False, True, True, False, True, False])
arr[mask]                 # array([25, 30, 40])

# Equivalent one-liner
arr[arr > 20]             # array([25, 30, 40])

# Combine conditions with & (and) | (or) ~ (not)
arr[(arr >= 15) & (arr <= 30)]  # array([25, 30, 15])

# np.where — conditional selection
np.where(arr > 20, arr, 0)     # array([ 0, 25, 30,  0, 40,  0])
np.where(arr > 20, 'high', 'low')  # array(['low','high','high','low','high','low'])

# np.select — multiple conditions
conditions = [arr < 10, arr < 25, arr < 35, arr >= 35]
choices     = ['tiny', 'small', 'medium', 'large']
np.select(conditions, choices)  # array(['tiny','small','medium','small','large','tiny'])
```

### 12.2.6 Performance: Vectorized Operations vs Loops

The core reason to use NumPy instead of Python lists is **speed**. NumPy operations execute in compiled C, bypassing Python's interpreter overhead:

```python
import numpy as np
import time

# Python loop
n = 1_000_000
py_list = list(range(n))

start = time.perf_counter()
result_loop = [x * 2 + 1 for x in py_list]
py_time = time.perf_counter() - start

# NumPy vectorized
arr = np.arange(n)

start = time.perf_counter()
result_vec = arr * 2 + 1
np_time = time.perf_counter() - start

print(f"Python loop: {py_time:.4f}s")
print(f"NumPy vectorized: {np_time:.4f}s")
print(f"Speedup: {py_time / np_time:.1f}x")
```

Typical results:

| Operation | Python List | NumPy Array | Speedup |
|-----------|-------------|-------------|---------|
| Element-wise multiply | ~45ms | ~1.5ms | ~30x |
| Sum | ~12ms | ~0.8ms | ~15x |
| Sorting | ~90ms | ~15ms | ~6x |
| Matrix multiply (1000x1000) | N/A (manual) | ~15ms | — |

**Rule of thumb**: If you're doing numerical computation on arrays, NumPy's vectorized operations will be 10–100× faster than equivalent Python loops.

---

## 12.3 Pandas for Data Manipulation

Pandas is built on top of NumPy and provides two primary data structures: the `Series` (a one-dimensional labeled array) and the `DataFrame` (a two-dimensional labeled table).

### 12.3.1 Series and DataFrame Creation

```python
import pandas as pd

# Series
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
# a    10
# b    20
# c    30
# d    40

# DataFrame from a dictionary
df = pd.DataFrame({
    'name':    ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age':     [28, 35, 42, 31],
    'city':    ['New York', 'London', 'Paris', 'Tokyo'],
    'salary':  [75000, 82000, 91000, 68000]
})
#       name  age      city  salary
# 0    Alice   28  New York   75000
# 1      Bob   35    London   82000
# 2  Charlie   42     Paris   91000
# 3    Diana   31     Tokyo   68000

# DataFrame from list of dicts
records = [
    {'product': 'Widget', 'price': 9.99, 'qty': 150},
    {'product': 'Gadget', 'price': 24.99, 'qty': 80},
    {'product': 'Gizmo', 'price': 14.99, 'qty': 200},
]
inventory = pd.DataFrame(records)
```

### 12.3.2 Reading Data

```python
# CSV (most common)
df = pd.read_csv('data.csv')
df = pd.read_csv('data.csv', sep='\t', encoding='utf-8')
df = pd.read_csv('data.csv', parse_dates=['date_col'], index_col='id')

# Excel
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')
df = pd.read_excel('data.xlsx', sheet_name=None)   # dict of all sheets

# JSON
df = pd.read_json('data.json')
df = pd.read_json('data.json', orient='records')

# Quick inspection
df.head()           # first 5 rows
df.tail(10)         # last 10 rows
df.shape            # (rows, cols)
df.info()           # column types, non-null counts
df.describe()       # summary statistics for numeric columns
df.dtypes           # data type of each column
df.columns          # column names as Index
df.values           # underlying NumPy array
```

### 12.3.3 Selection: loc, iloc, and Column Access

```python
# Column selection
df['name']              # returns a Series
df[['name', 'age']]    # returns a DataFrame (list of columns)

# loc — label-based indexing
df.loc[0]               # first row as Series
df.loc[0:2]             # rows 0, 1, 2 (inclusive on both ends!)
df.loc[0:2, 'name':'salary']  # rows 0-2, columns name through salary

# iloc — integer-position-based indexing
df.iloc[0]              # first row
df.iloc[0:2]            # rows 0 and 1 (exclusive end!)
df.iloc[0:2, 0:3]       # first 2 rows, first 3 columns

# At and iat — single value access
df.at[0, 'name']        # label-based single value
df.iat[0, 0]            # position-based single value
```

### 12.3.4 Filtering and Boolean Indexing

```python
# Simple filter
seniors = df[df['age'] > 30]

# Multiple conditions (use & for AND, | for OR, ~ for NOT)
seniors_paris = df[(df['age'] > 30) & (df['city'] == 'Paris')]

# isin — match against a list
selected = df[df['city'].isin(['London', 'Tokyo'])]

# String methods
names_start_a = df[df['name'].str.startswith('A')]

# Query method — SQL-like syntax
result = df.query('age > 30 and salary > 70000')
```

### 12.3.5 GroupBy Operations

GroupBy follows a split-apply-combine paradigm:

```python
# Sample data
sales = pd.DataFrame({
    'region':   ['East', 'West', 'East', 'West', 'East', 'West'],
    'product':  ['A', 'A', 'B', 'B', 'A', 'B'],
    'revenue':  [100, 150, 200, 120, 180, 90]
})

# Group by single column
region_totals = sales.groupby('region')['revenue'].sum()
# region
# East    480
# West    360

# Group by multiple columns
region_product = sales.groupby(['region', 'product'])['revenue'].mean()

# Multiple aggregations
summary = sales.groupby('region')['revenue'].agg(['sum', 'mean', 'count', 'max'])

# Custom aggregation
def range_(x):
    return x.max() - x.min()

sales.groupby('region')['revenue'].agg(['sum', range_])
```

### 12.3.6 Handling Missing Data

```python
# Detect missing values
df.isna()              # boolean DataFrame
df.isna().sum()        # count of NaN per column
df.isna().sum().sum()  # total missing values

# Fill missing values
df.fillna(0)                       # fill with constant
df['age'].fillna(df['age'].mean()) # fill with column mean
df.fillna(method='ffill')          # forward fill (propagate last valid)
df.fillna(method='bfill')          # backward fill (propagate next valid)

# Drop missing values
df.dropna()                        # drop any row with NaN
df.dropna(subset=['age', 'city'])  # drop only if specific cols are NaN
df.dropna(thresh=3)                # drop rows with fewer than 3 non-NaN values

# Detect and handle duplicates
df.duplicated().sum()              # count duplicate rows
df.drop_duplicates()               # remove duplicate rows
df.drop_duplicates(subset=['name'])  # deduplicate by name
```

### 12.3.7 Merge, Join, and Concat

```python
# Merge — SQL-style joins on keys
employees = pd.DataFrame({
    'emp_id': [1, 2, 3], 'name': ['Alice', 'Bob', 'Charlie'], 'dept_id': [10, 20, 10]
})
departments = pd.DataFrame({
    'dept_id': [10, 20, 30], 'dept_name': ['Engineering', 'Marketing', 'Sales']
})

pd.merge(employees, departments, on='dept_id', how='inner')  # inner join
pd.merge(employees, departments, on='dept_id', how='left')   # left join
pd.merge(employees, departments, on='dept_id', how='outer')  # full outer join

# Concat — stack DataFrames vertically or horizontally
pd.concat([df1, df2], axis=0)       # vertical stack (add rows)
pd.concat([df1, df2], axis=1)       # horizontal stack (add columns)

# Join — convenience method for index-based joins
df1.join(df2, how='left')
```

### 12.3.8 Apply and Map Functions

```python
# apply — apply a function to each row or column
df['salary_k'] = df['salary'].apply(lambda x: x / 1000)

# apply on entire DataFrame
df['info'] = df.apply(lambda row: f"{row['name']} ({row['age']})", axis=1)

# map — element-wise transformation on a Series
city_codes = {'New York': 'NYC', 'London': 'LDN', 'Paris': 'PAR', 'Tokyo': 'TYO'}
df['city_code'] = df['city'].map(city_codes)

# applymap — element-wise on entire DataFrame (deprecated, use map)
df_numeric = df[['age', 'salary']].map(lambda x: x * 1.1)  # 10% raise
```

### 12.3.9 Data Cleaning Patterns

```python
# Standardize string columns
df['name'] = df['name'].str.strip().str.lower().str.title()

# Convert data types
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
df['price'] = pd.to_numeric(df['price'], errors='coerce')  # invalid -> NaN

# Rename columns
df.rename(columns={'old_name': 'new_name'}, inplace=True)
df.columns = [col.lower().replace(' ', '_') for col in df.columns]

# Replace values
df['status'].replace({'active': 1, 'inactive': 0}, inplace=True)

# Binning continuous variables
df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 50, 100],
                         labels=['young', 'mid', 'senior', 'elderly'])
```

---

## 12.4 Data Visualization with Matplotlib

Visualization is how you communicate findings. Matplotlib is the foundational plotting library — Seaborn and Pandas plotting are built on top of it.

### 12.4.1 Figure and Axes Objects

Matplotlib has two APIs: the **state-machine** (pyplot) interface and the **object-oriented** interface. Always prefer the OO approach for anything beyond trivial plots:

```python
import matplotlib.pyplot as plt

# Object-oriented approach (recommended)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot([1, 2, 3, 4], [10, 20, 25, 30], color='steelblue', marker='o')
ax.set_title('Sales Over Time')
ax.set_xlabel('Month')
ax.set_ylabel('Revenue ($K)')
plt.tight_layout()
plt.savefig('sales_plot.png', dpi=150)
plt.show()
```

### 12.4.2 Basic Plot Types

```python
# --- Line Plot ---
fig, ax = plt.subplots()
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
revenue = [10, 15, 13, 18, 22]
ax.plot(months, revenue, marker='o', linestyle='--', color='#2196F3')

# --- Bar Chart ---
fig, ax = plt.subplots()
categories = ['A', 'B', 'C', 'D']
values = [23, 45, 12, 67]
ax.bar(categories, values, color=['#e74c3c', '#3498db', '#2ecc71', '#f39c12'])

# --- Scatter Plot ---
fig, ax = plt.subplots()
x = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2, 4, 5, 4, 5, 8, 9, 10]
sizes = [20, 50, 80, 30, 60, 40, 70, 90]
ax.scatter(x, y, s=sizes, alpha=0.6, c='#9b59b6', edgecolors='black')

# --- Histogram ---
import numpy as np
data = np.random.normal(loc=100, scale=15, size=1000)
fig, ax = plt.subplots()
ax.hist(data, bins=30, color='steelblue', edgecolor='white', alpha=0.8)
ax.axvline(data.mean(), color='red', linestyle='--', label=f'Mean: {data.mean():.1f}')
ax.legend()

# --- Pie Chart ---
fig, ax = plt.subplots()
sizes = [35, 30, 20, 15]
labels = ['Python', 'JavaScript', 'Go', 'Rust']
ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
ax.set_title('Language Popularity')
```

### 12.4.3 Subplots and Layout

```python
# Multiple subplots in a grid
fig, axes = plt.subplots(2, 2, figsize=(10, 8))   # 2x2 grid

axes[0, 0].plot([1, 2, 3], [1, 4, 9])
axes[0, 0].set_title('Squared')

axes[0, 1].bar(['A', 'B', 'C'], [5, 3, 7])
axes[0, 1].set_title('Categories')

axes[1, 0].hist(np.random.randn(1000), bins=30)
axes[1, 0].set_title('Normal Distribution')

axes[1, 1].scatter(np.random.rand(50), np.random.rand(50))
axes[1, 1].set_title('Random Points')

plt.suptitle('Dashboard', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Different subplot sizes with GridSpec
fig = plt.figure(figsize=(12, 6))
gs = fig.add_gridspec(2, 3)
ax_main = fig.add_subplot(gs[0, :2])     # spans 2 cols in row 0
ax_side1 = fig.add_subplot(gs[0, 2])
ax_side2 = fig.add_subplot(gs[1, :])
```

### 12.4.4 Customization

```python
fig, ax = plt.subplots(figsize=(10, 6))

# Styling
ax.plot([1, 2, 3, 4, 5], [2, 4, 3, 5, 4],
        color='#e74c3c', linewidth=2, marker='o', markersize=8,
        markerfacecolor='white', markeredgecolor='#e74c3c', markeredgewidth=2)

# Titles and labels
ax.set_title('Quarterly Performance', fontsize=16, fontweight='bold', pad=15)
ax.set_xlabel('Quarter', fontsize=12)
ax.set_ylabel('Revenue ($M)', fontsize=12)

# Grid and spines
ax.grid(True, alpha=0.3, linestyle='--')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Ticks
ax.set_xticks([1, 2, 3, 4, 5])
ax.set_xticklabels(['Q1', 'Q2', 'Q3', 'Q4', 'Q5'])
ax.tick_params(axis='both', labelsize=10)

# Legend
ax.plot([1, 2, 3, 4, 5], [3, 2, 4, 3, 5], label='Projected', linestyle='--')
ax.legend(loc='upper left', framealpha=0.9)

plt.tight_layout()
plt.show()
```

### 12.4.5 Seaborn Basics

Seaborn provides a higher-level interface with beautiful defaults for statistical plots:

```python
import seaborn as sns

# Set a theme
sns.set_theme(style='whitegrid')
sns.set_palette('husl')

# Distribution plot
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
tips = sns.load_dataset('tips')
sns.histplot(data=tips, x='total_bill', kde=True, ax=axes[0])
sns.boxplot(data=tips, x='day', y='total_bill', ax=axes[1])
plt.tight_layout()

# Pair plot — scatter matrix for all numeric columns
sns.pairplot(tips, hue='sex', diag_kind='kde')

# Heatmap — correlation matrix
fig, ax = plt.subplots(figsize=(8, 6))
numeric_tips = tips.select_dtypes(include='number')
sns.heatmap(numeric_tips.corr(), annot=True, cmap='coolwarm', center=0, ax=ax)
```

### 12.4.6 Plotting with Pandas

Pandas has built-in plotting that wraps Matplotlib:

```python
df = pd.DataFrame({
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    'sales_a': [10, 15, 13, 18, 22],
    'sales_b': [8, 12, 15, 20, 18]
}).set_index('month')

df.plot(figsize=(10, 5), kind='bar')
df.plot(figsize=(10, 5), kind='line', marker='o')
df.plot(figsize=(10, 5), kind='scatter', x='sales_a', y='sales_b')
df['sales_a'].plot(kind='hist', bins=5, title='Sales A Distribution')
```

---

## 12.5 Exploratory Data Analysis (EDA)

EDA is the process of investigating a dataset to discover patterns, spot anomalies, test hypotheses, and check assumptions — all *before* building any models.

### 12.5.1 EDA Workflow

```
┌──────────────┐    ┌──────────────┐    ┌───────────────┐
│  1. Load &   │───▶│ 2. Structure │───▶│ 3. Summary    │
│  Inspect     │    │   & Types    │    │  Statistics   │
└──────────────┘    └──────────────┘    └───────┬───────┘
                                                │
┌──────────────┐    ┌──────────────┐    ┌───────▼───────┐
│  6. Document │◀──│ 5. Feature   │◀──│ 4. Distributions│
│  Findings    │    │  Relationships│    │  & Outliers    │
└──────────────┘    └──────────────┘    └───────────────┘
```

### 12.5.2 Descriptive Statistics

```python
import pandas as pd
import numpy as np

# Generate sample dataset
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'age': np.random.normal(40, 12, n).astype(int).clip(18, 80),
    'income': np.random.lognormal(10.5, 0.5, n).astype(int),
    'score': np.random.uniform(0, 100, n).round(1),
    'department': np.random.choice(['Engineering', 'Sales', 'Marketing', 'HR'], n),
    'years_exp': np.random.poisson(8, n),
})

# Quick overview
df.shape              # (500, 5)
df.info()             # types and null counts
df.head(10)           # first 10 rows

# Statistical summary
df.describe()                     # numeric columns
df.describe(include='object')     # categorical columns
df.describe(include='all')        # all columns

# Individual statistics
df['income'].median()
df['income'].quantile([0.25, 0.5, 0.75])
df['department'].value_counts()
df['department'].value_counts(normalize=True)   # proportions
```

### 12.5.3 Correlation Analysis

```python
# Correlation matrix (Pearson by default)
corr_matrix = df[['age', 'income', 'score', 'years_exp']].corr()

# Different correlation methods
df[['income', 'score']].corr(method='spearman')  # rank correlation
df[['income', 'score']].corr(method='kendall')    # Kendall tau

# Visualize correlation
import seaborn as sns
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap='RdBu_r', center=0,
            vmin=-1, vmax=1, square=True, fmt='.2f', ax=ax)
ax.set_title('Correlation Matrix')
plt.tight_layout()
plt.show()

# Find highly correlated pairs
threshold = 0.7
high_corr = []
for i in range(len(corr_matrix.columns)):
    for j in range(i + 1, len(corr_matrix.columns)):
        if abs(corr_matrix.iloc[i, j]) > threshold:
            high_corr.append((
                corr_matrix.columns[i],
                corr_matrix.columns[j],
                corr_matrix.iloc[i, j]
            ))
```

### 12.5.4 Distribution Analysis

```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Histogram with KDE
sns.histplot(df['income'], kde=True, ax=axes[0, 0], color='steelblue')
axes[0, 0].set_title('Income Distribution')

# Box plot
sns.boxplot(y=df['income'], ax=axes[0, 1], color='lightcoral')
axes[0, 1].set_title('Income Box Plot')

# Violin plot
sns.violinplot(x='department', y='score', data=df, ax=axes[1, 0])
axes[1, 0].set_title('Score by Department')

# QQ plot (check normality)
from scipy import stats
stats.probplot(df['income'], dist='norm', plot=axes[1, 1])
axes[1, 1].set_title('Q-Q Plot: Income')

plt.suptitle('Distribution Analysis', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 12.5.5 Identifying Outliers

```python
# IQR method
Q1 = df['income'].quantile(0.25)
Q3 = df['income'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

outliers = df[(df['income'] < lower) | (df['income'] > upper)]
print(f"Outliers found: {len(outliers)}")

# Z-score method
from scipy import stats
z_scores = np.abs(stats.zscore(df['income']))
outliers_z = df[z_scores > 3]
print(f"Z-score outliers: {len(outliers_z)}")
```

---

## 12.6 Introduction to Machine Learning

### 12.6.1 What Is Machine Learning?

Machine learning is a subset of artificial intelligence where systems learn patterns from data to make predictions or decisions *without being explicitly programmed*. The key insight: instead of writing rules, you provide examples and let the algorithm discover the rules.

### 12.6.2 Types of Machine Learning

```
                    ┌───────────────────────────────────┐
                    │       Machine Learning             │
                    └───────────────┬───────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
   ┌────────▼────────┐   ┌─────────▼─────────┐   ┌────────▼────────┐
   │   Supervised    │   │   Unsupervised    │   │ Reinforcement   │
   │   Learning      │   │    Learning       │   │   Learning      │
   └────────┬────────┘   └─────────┬─────────┘   └────────┬────────┘
            │                      │                      │
     ┌──────┴──────┐        ┌─────┴──────┐        ┌──────┴──────┐
     │             │        │            │        │             │
 ┌───▼───┐  ┌─────▼──┐ ┌───▼───┐  ┌────▼───┐ ┌──▼──┐   ┌────▼────┐
 │Regression│ │Classifi│ │Clustering│ │Dimension│ │Game│   │ Robotics│
 │         │ │ cation │ │         │ │ality    │ │ AI │   │         │
 └────────┘ └────────┘ └────────┘ └────────┘ └────┘   └─────────┘
```

| Type | Labeled Data? | Goal | Examples |
|------|--------------|------|----------|
| **Supervised** | Yes | Predict outcomes | Spam detection, price prediction |
| **Unsupervised** | No | Discover structure | Customer segmentation, anomaly detection |
| **Reinforcement** | Reward signal | Maximize cumulative reward | Game AI, robotics, RLHF |

### 12.6.3 Training, Validation, and Test Splits

You must separate your data to evaluate model performance honestly:

```python
from sklearn.model_selection import train_test_split

# Typical split: 60% train, 20% validation, 20% test
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.4, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)

print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
```

- **Training set** — the model learns from this data
- **Validation set** — used to tune hyperparameters and make model selection decisions
- **Test set** — held out until the very end; the final, unbiased measure of performance

### 12.6.4 Overfitting and Underfitting

```
  Performance
  ▲
  │         ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾  Training accuracy (keeps rising)
  │       ╱
  │     ╱
  │   ╱    ╲
  │  ╱      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾  Validation accuracy (peaks, then drops)
  │╱   ↑          ↑              ↑
  │  Underfit   Sweet Spot     Overfit
  │──────────────────────────────────────▶ Model Complexity
```

- **Underfitting** — model is too simple, performs poorly on both training and validation data
- **Overfitting** — model memorizes training data including noise, performs great on training but poorly on new data
- **Good fit** — model generalizes well to unseen data

### 12.6.5 The Bias-Variance Tradeoff

```
Total Error = Bias² + Variance + Irreducible Noise

High Bias (Underfitting)          High Variance (Overfitting)
├─ Model too simple               ├─ Model too complex
├─ Misses true patterns           ├─ Fits noise in training data
├─ Low variance, high bias        ├─ High variance, low bias
└─ Fix: more features,            └─ Fix: more data, regularization,
   more complex model                simpler model, pruning
```

---

## 12.7 Supervised Learning with scikit-learn

scikit-learn provides a consistent API across all its algorithms: instantiate a model, call `.fit(X, y)`, then call `.predict(X_new)`.

### 12.7.1 Linear Regression

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# Generate sample data
np.random.seed(42)
X = 2 * np.random.rand(100, 1)
y = 4 + 3 * X.squeeze() + np.random.randn(100) * 0.5

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit
model = LinearRegression()
model.fit(X_train, y_train)

# Inspect
print(f"Coefficient: {model.coef_[0]:.4f}")    # ~3.0
print(f"Intercept:   {model.intercept_:.4f}")   # ~4.0

# Predict
y_pred = model.predict(X_test)

# Evaluate
print(f"MSE:  {mean_squared_error(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R²:   {r2_score(y_test, y_pred):.4f}")
```

### 12.7.2 Classification

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load built-in dataset
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# Logistic Regression
lr = LogisticRegression(max_iter=200, random_state=42)
lr.fit(X_train, y_train)
y_pred_lr = lr.predict(X_test)

# Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)

# Evaluate
print("Logistic Regression:")
print(f"  Accuracy: {accuracy_score(y_test, y_pred_lr):.4f}")
print(f"\n{classification_report(y_test, y_pred_lr, target_names=iris.target_names)}")

print("Random Forest:")
print(f"  Accuracy: {accuracy_score(y_test, y_pred_rf):.4f}")

# Confusion matrix
print(confusion_matrix(y_test, y_pred_rf))
```

### 12.7.3 Feature Scaling

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# StandardScaler: zero mean, unit variance
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # only transform!

# MinMaxScaler: scales to [0, 1]
minmax = MinMaxScaler()
X_train_minmax = minmax.fit_transform(X_train)

# CRITICAL: fit on training data only, then transform both
# This prevents data leakage from test set into training
```

### 12.7.4 Pipelines

Pipelines chain preprocessing and modeling into a single object, preventing data leakage:

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# Create a pipeline
pipeline = make_pipeline(
    StandardScaler(),
    LogisticRegression(max_iter=200)
)

# Use like any other model
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")

# Pipelines apply all steps correctly during cross-validation
# The scaler is fit only on each training fold, never on the test fold
```

### 12.7.5 Model Evaluation Metrics

```python
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, confusion_matrix, classification_report,
                              roc_auc_score, roc_curve)

# For classification
print(classification_report(y_test, y_pred, target_names=['Class 0', 'Class 1']))

#         precision    recall  f1-score   support
# Class 0       0.95      0.98      0.96        60
# Class 1       0.92      0.85      0.88        28
# ...
# accuracy                           0.94        88

# ROC-AUC (for binary classification with probabilities)
y_prob = pipeline.predict_proba(X_test)[:, 1]
roc_auc = roc_auc_score(y_test, y_prob)

# For regression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)
```

| Metric | What It Measures | When to Use |
|--------|-----------------|-------------|
| **Accuracy** | Correct predictions / total | Balanced classes |
| **Precision** | True positives / predicted positives | Cost of false positives is high |
| **Recall** | True positives / actual positives | Cost of false negatives is high |
| **F1 Score** | Harmonic mean of precision & recall | Imbalanced classes |
| **ROC-AUC** | Area under ROC curve | Probabilistic classifiers |
| **R²** | Variance explained by model | Regression |
| **MAE** | Average absolute error | Regression (robust to outliers) |
| **RMSE** | Root mean squared error | Regression (penalizes large errors) |

### 12.7.6 Cross-Validation

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold

# Simple cross-validation (5-fold default)
scores = cross_val_score(pipeline, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.4f} ± {scores.std():.4f}")

# Stratified K-Fold — preserves class proportions in each fold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X, y, cv=skf, scoring='f1_weighted')
print(f"Stratified CV F1: {scores.mean():.4f} ± {scores.std():.4f}")

# Cross-validation with multiple scoring metrics
from sklearn.model_selection import cross_validate
results = cross_validate(pipeline, X, y, cv=5,
                         scoring=['accuracy', 'f1_weighted', 'precision_weighted'])
for metric in results:
    if metric.startswith('test_'):
        print(f"{metric}: {results[metric].mean():.4f}")
```

### 12.7.7 Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

# Define parameter grid
param_grid = {
    'randomforestclassifier__n_estimators': [50, 100, 200],
    'randomforestclassifier__max_depth': [None, 5, 10, 20],
    'randomforestclassifier__min_samples_split': [2, 5, 10],
}

rf_pipeline = make_pipeline(
    StandardScaler(),
    RandomForestClassifier(random_state=42)
)

# Grid Search — exhaustively tries all combinations
grid_search = GridSearchCV(
    rf_pipeline, param_grid,
    cv=5, scoring='accuracy', n_jobs=-1, verbose=1
)
grid_search.fit(X_train, y_train)

print(f"Best params: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_:.4f}")

# Use the best model
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)
print(f"Test accuracy: {accuracy_score(y_test, y_pred):.4f}")

# RandomizedSearchCV — samples random combinations (faster for large grids)
from scipy.stats import randint, uniform
param_dist = {
    'randomforestclassifier__n_estimators': randint(50, 300),
    'randomforestclassifier__max_depth': [None, 5, 10, 20, 30],
    'randomforestclassifier__min_samples_split': randint(2, 20),
}

random_search = RandomizedSearchCV(
    rf_pipeline, param_dist, n_iter=50, cv=5,
    scoring='accuracy', random_state=42, n_jobs=-1
)
random_search.fit(X_train, y_train)
```

---

## 12.8 Unsupervised Learning

Unsupervised learning finds hidden structure in data without labeled targets.

### 12.8.1 KMeans Clustering

```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
import matplotlib.pyplot as plt

# Generate synthetic data with 4 natural clusters
X, y_true = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=42)

# Fit KMeans
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
kmeans.fit(X)
labels = kmeans.labels_
centroids = kmeans.cluster_centers_

# Visualize
fig, ax = plt.subplots(figsize=(8, 6))
scatter = ax.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', alpha=0.6, s=30)
ax.scatter(centroids[:, 0], centroids[:, 1], c='red', marker='X', s=200,
           edgecolors='black', linewidths=2, label='Centroids')
ax.set_title('KMeans Clustering (k=4)')
ax.legend()
plt.show()

# Inertia (within-cluster sum of squares)
print(f"Inertia: {kmeans.inertia_:.2f}")
print(f"Iterations to converge: {kmeans.n_iter_}")
```

### 12.8.2 Finding Optimal K — The Elbow Method

```python
inertias = []
K_range = range(2, 11)

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertias.append(km.inertia_)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(K_range, inertias, 'bo-', linewidth=2, markersize=8)
ax.set_xlabel('Number of Clusters (k)')
ax.set_ylabel('Inertia')
ax.set_title('Elbow Method for Optimal k')
ax.set_xticks(list(K_range))
ax.grid(True, alpha=0.3)
plt.show()
```

The "elbow" — the point where inertia starts decreasing more slowly — indicates the optimal number of clusters.

### 12.8.3 Principal Component Analysis (PCA)

PCA reduces dimensionality while preserving as much variance as possible:

```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize before PCA
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Apply PCA — reduce to 2 dimensions
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.2%}")

# Scree plot — how many components to keep
pca_full = PCA().fit(X_scaled)
cumvar = np.cumsum(pca_full.explained_variance_ratio_)

fig, ax = plt.subplots(figsize=(8, 5))
ax.bar(range(1, len(cumvar) + 1), pca_full.explained_variance_ratio_, alpha=0.6, label='Individual')
ax.step(range(1, len(cumvar) + 1), cumvar, where='mid', color='red', label='Cumulative')
ax.set_xlabel('Principal Component')
ax.set_ylabel('Explained Variance Ratio')
ax.set_title('PCA Scree Plot')
ax.legend()
ax.axhline(y=0.95, color='gray', linestyle='--', alpha=0.5, label='95% threshold')
plt.show()
```

### 12.8.4 Practical Clustering Example

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import pandas as pd

# Customer data
np.random.seed(42)
customers = pd.DataFrame({
    'annual_income': np.random.lognormal(10.5, 0.5, 200).astype(int),
    'spending_score': np.random.uniform(1, 100, 200).round(1),
    'age': np.random.normal(40, 12, 200).astype(int).clip(18, 70),
})

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(customers)

# Find best k using silhouette score
best_score = -1
best_k = 2
for k in range(2, 9):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}: silhouette={score:.3f}")
    if score > best_score:
        best_score = score
        best_k = k

print(f"\nBest k: {best_k} (silhouette: {best_score:.3f})")

# Final clustering
km_final = KMeans(n_clusters=best_k, random_state=42, n_init=10)
customers['segment'] = km_final.fit_predict(X_scaled)

# Profile each segment
print(customers.groupby('segment').mean().round(1))
```

---

## 12.9 A Complete ML Pipeline

### 12.9.1 Pipeline Stages

```
┌───────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐
│  Raw Data │──▶│  Clean & │──▶│  Feature │──▶│  Train   │──▶│  Evaluate │
│           │   │  Handle  │   │ Engineer │   │  Model   │   │  & Deploy │
│           │   │ Missing  │   │  & Encode│   │          │   │           │
└───────────┘   └──────────┘   └──────────┘   └──────────┘   └───────────┘
                  │                │                │
                  ▼                ▼                ▼
              dropna()        OneHotEncoder    Train/test split
              fillna()        StandardScaler   Cross-validation
              interpolate()   LabelEncoder     GridSearchCV
```

### 12.9.2 Handling Categorical Data

```python
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
import pandas as pd

df = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'red', 'blue', 'green'],
    'size':  ['S', 'M', 'L', 'M', 'S', 'L'],
    'price': [10, 20, 15, 12, 18, 14]
})

# OneHotEncoder — creates binary columns (preferred for nominal data)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline as SkPipeline

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first', sparse_output=False), ['color', 'size']),
        ('num', StandardScaler(), ['price']),
    ]
)

# LabelEncoder — single column, ordinal encoding (target variable only)
le = LabelEncoder()
df['color_encoded'] = le.fit_transform(df['color'])
# blue=0, green=1, red=2
```

### 12.9.3 Handling Text Data

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "Python is great for data science",
    "Machine learning needs lots of data",
    "Data visualization tells the story",
    "Python and machine learning together",
]

# TF-IDF vectorization
vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
X_tfidf = vectorizer.fit_transform(documents)

print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")
print(f"Document-term matrix shape: {X_tfidf.shape}")

# Convert to DataFrame for readability
tfidf_df = pd.DataFrame(
    X_tfidf.toarray(),
    columns=vectorizer.get_feature_names_out()
)
print(tfidf_df.round(2))
```

### 12.9.4 End-to-End Example

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report
import joblib

# --- 1. Load data ---
from sklearn.datasets import fetch_california_housing
# For classification, use a different dataset
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = pd.Series(data.target, name='target')

print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
print(f"Classes: {dict(zip(*np.unique(y, return_counts=True)))}")

# --- 2. Split data ---
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# --- 3. Build pipeline ---
pipeline = make_pipeline(
    StandardScaler(),
    GradientBoostingClassifier(
        n_estimators=100, max_depth=3, learning_rate=0.1, random_state=42
    )
)

# --- 4. Cross-validate ---
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# --- 5. Train and evaluate ---
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# --- 6. Save the model ---
joblib.dump(pipeline, 'breast_cancer_model.joblib')
print("Model saved.")

# --- 7. Load and predict ---
loaded_model = joblib.load('breast_cancer_model.joblib')
sample = X_test.iloc[:5]
predictions = loaded_model.predict(sample)
print(f"\nPredictions: {predictions}")
print(f"Actual:      {y_test.iloc[:5].values}")
```

### 12.9.5 Model Persistence

```python
import joblib

# Save
joblib.dump(model, 'model.joblib')

# Load
loaded_model = joblib.load('model.joblib')
predictions = loaded_model.predict(new_data)

# Alternative: pickle (built-in, but less robust)
import pickle
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('model.pkl', 'rb') as f:
    loaded_model = pickle.load(f)
```

**Always prefer `joblib` over `pickle` for scikit-learn models** — it handles large NumPy arrays more efficiently via internal compression.

---

## 12.10 Working with Real Data

### 12.10.1 Public Datasets

```python
# scikit-learn built-in datasets
from sklearn.datasets import load_iris, load_wine, load_digits, load_breast_cancer
iris = load_iris()
print(iris.DESCR)    # full dataset description

# Fetch from OpenML
from sklearn.datasets import fetch_openml
mnist = fetch_openml('mnist_784', version=1, as_frame=False)

# Kaggle datasets (requires kaggle CLI: pip install kaggle)
# kaggle datasets download -d <owner>/<dataset-name>

# UCI Machine Learning Repository
import pandas as pd
url = "https://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/winequality-red.csv"
wine = pd.read_csv(url, sep=';')
print(wine.head())
```

### 12.10.2 Data Cleaning Checklist

Before any analysis or modeling, systematically address these items:

| Step | Action | Pandas Method |
|------|--------|---------------|
| 1 | Identify missing values | `df.isna().sum()` |
| 2 | Check data types | `df.dtypes` |
| 3 | Remove duplicates | `df.drop_duplicates()` |
| 4 | Fix inconsistent text | `df['col'].str.lower().str.strip()` |
| 5 | Validate ranges | `df.describe()`, boolean masks |
| 6 | Handle outliers | IQR or Z-score methods |
| 7 | Convert types | `pd.to_datetime()`, `pd.to_numeric()` |
| 8 | Standardize column names | `df.columns.str.lower().str.replace(' ', '_')` |
| 9 | Validate referential integrity | Check foreign key columns |
| 10 | Document transformations | Comments or a cleaning log |

### 12.10.3 Feature Engineering Basics

Feature engineering is the art of creating informative input variables from raw data:

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=100, freq='D'),
    'revenue': np.random.lognormal(10, 0.3, 100),
    'units_sold': np.random.poisson(50, 100),
    'category': np.random.choice(['A', 'B', 'C'], 100),
})

# Date-based features
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day_of_week'] = df['date'].dt.dayofweek
df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)
df['quarter'] = df['date'].dt.quarter

# Numeric transformations
df['log_revenue'] = np.log1p(df['revenue'])  # log(1 + x) — handles zeros
df['price_per_unit'] = df['revenue'] / df['units_sold']
df['revenue_rank'] = df['revenue'].rank(pct=True)  # percentile rank

# Interaction features
df['revenue_x_units'] = df['revenue'] * df['units_sold']

# Binning
df['revenue_tier'] = pd.qcut(df['revenue'], q=4, labels=['Low', 'Med-Low', 'Med-High', 'High'])

# Rolling window features
df['revenue_7d_ma'] = df['revenue'].rolling(window=7).mean()
df['revenue_7d_std'] = df['revenue'].rolling(window=7).std()
```

### 12.10.4 Common Pitfalls in Data Science

| Pitfall | Description | Prevention |
|---------|-------------|------------|
| **Data leakage** | Test information leaks into training | Always split first; use pipelines |
| **Target leakage** | Feature contains future information | Careful feature selection; domain knowledge |
| **Survivorship bias** | Analyzing only "surviving" records | Include failures and dropped records |
| **Confirmation bias** | Looking for patterns that confirm beliefs | Formulate hypotheses *before* looking at data |
| **Overfitting** | Model fits noise, not signal | Cross-validation, regularization, simpler models |
| **Imbalanced classes** | Minority class ignored | SMOTE, class weights, appropriate metrics |
| **Ignoring missing data** | Treating NaN as zero or dropping blindly | Analyze *why* data is missing first |
| **Not validating results** | Trusting single train/test split | Always cross-validate |
| **Wrong metric** | Optimizing accuracy on imbalanced data | Use F1, AUC, or domain-relevant metric |
| **Reproducibility** | Results can't be reproduced | Set random seeds, version data and code |

```python
# Anti-pattern: data leakage
# WRONG — fit scaler on entire dataset before splitting
scaler.fit_transform(X)       # test data statistics influence training

# RIGHT — fit only on training data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler.fit_transform(X_train) # fit on train only
scaler.transform(X_test)      # transform test with train statistics

# Anti-pattern: not setting random seeds
# WRONG
X_train, X_test = train_test_split(X, test_size=0.2)  # different every time

# RIGHT
X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)  # reproducible
```

---

## Key Takeaways

1. **Data science is iterative** — the pipeline loops back constantly; expect to revisit earlier stages as you learn from the data.
2. **NumPy is the foundation** — all other data science libraries (Pandas, scikit-learn, Matplotlib) are built on NumPy arrays; vectorized operations are 10–100× faster than Python loops.
3. **Pandas is your data workhorse** — `DataFrame` handles loading, cleaning, transforming, and aggregating tabular data with a concise, expressive API.
4. **Always explore before modeling** — EDA with `describe()`, correlation analysis, and visualization prevents wasted effort on unsuitable models or flawed data.
5. **Split your data** — always separate training, validation, and test sets to get honest performance estimates; use `stratify=y` for classification tasks.
6. **Prevent data leakage** — fit preprocessing (scaling, encoding) on training data only; use scikit-learn `Pipeline` to enforce this automatically.
7. **Cross-validate** — never trust a single train/test split; use k-fold cross-validation for robust performance estimates.
8. **Choose the right metric** — accuracy is misleading for imbalanced datasets; use precision, recall, F1, or ROC-AUC depending on the business cost of errors.
9. **Feature engineering often matters more than model selection** — well-crafted features from domain knowledge can outperform sophisticated algorithms on poor features.
10. **Reproducibility is non-negotiable** — set random seeds, version your data and code, and document every transformation.
11. **Start simple** — begin with interpretable models (logistic regression, decision trees) before reaching for complex ones; simplicity aids debugging and communication.
12. **Watch for overfitting** — if training performance vastly exceeds validation performance, your model is memorizing noise; regularize, simplify, or get more data.

---

## Practice Exercises

### Exercise 1: NumPy Array Operations

Build the following functions that operate on NumPy arrays. Include docstrings and type hints.

```python
import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """Normalize an array to [0, 1] using min-max scaling."""
    # Your code here
    pass

def moving_average(arr: np.ndarray, window: int) -> np.ndarray:
    """Compute a simple moving average with the given window size.
    The result will be shorter than the input (no padding)."""
    # Your code here
    pass

def euclidean_distance_matrix(points: np.ndarray) -> np.ndarray:
    """Given an (n, d) array of n points in d dimensions,
    return the (n, n) pairwise Euclidean distance matrix."""
    # Your code here
    pass

# Tests
arr = np.array([3.0, 7.0, 1.0, 9.0, 4.0])
assert normalize(arr).min() == 0.0
assert normalize(arr).max() == 1.0
assert len(moving_average(arr, 3)) == len(arr) - 2

pts = np.array([[0, 0], [3, 0], [0, 4]])
dists = euclidean_distance_matrix(pts)
assert dists[0, 1] == 3.0
assert dists[0, 2] == 4.0
assert dists[1, 2] == 5.0
print("All tests passed!")
```

### Exercise 2: Pandas Data Wrangling

Given a messy sales dataset, perform a complete data cleaning and analysis pipeline.

```python
import pandas as pd
import numpy as np

# Create sample messy data
np.random.seed(42)
messy_sales = pd.DataFrame({
    'Date': np.random.choice(pd.date_range('2024-01-01', periods=365), 200),
    'Product': np.random.choice(['Widget A', 'widget a', 'WIDGET A', 'Gadget B', 'gadget b'], 200),
    'Revenue': np.append(
        np.random.lognormal(5, 1, 195),
        [np.nan, -50, np.nan, 99999, np.nan]   # introduce anomalies
    ),
    'Units': np.random.randint(1, 50, 200).astype(float),
    'Region': np.random.choice(['North', 'South', 'East', 'West', None], 200),
})

# TODO: Complete these steps
def clean_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the messy sales DataFrame:
    1. Standardize Product names (strip, lowercase, title case)
    2. Remove rows with negative Revenue
    3. Cap Revenue at the 99th percentile (remove extreme outliers)
    4. Fill missing Revenue with the median of non-null values
    5. Fill missing Region with 'Unknown'
    6. Add a 'Month' column extracted from Date
    7. Add a 'Revenue_per_Unit' column
    """
    # Your code here
    pass

def analyze_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Analyze cleaned sales data:
    1. Monthly revenue by product (pivot table)
    2. Region with highest average revenue
    3. Best-selling month overall
    """
    # Your code here
    pass
```

### Exercise 3: Build a Complete Classifier

Build and evaluate a classifier on the Iris dataset with feature engineering and hyperparameter tuning.

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import pandas as pd
import numpy as np

iris = load_iris()
X = pd.DataFrame(iris.data, columns=iris.feature_names)
y = iris.target

# TODO:
# 1. Create engineered features (e.g., ratios between existing features)
# 2. Split data 80/20 with stratification
# 3. Compare 3 models via cross-validation: LogisticRegression, RandomForest, GradientBoosting
# 4. For the best model, perform GridSearchCV to find optimal hyperparameters
# 5. Print final classification report on the test set

def build_classifier(X, y):
    """Build, tune, and evaluate a classifier.
    Return the best fitted pipeline and the classification report string."""
    # Your code here
    pass

best_model, report = build_classifier(X, y)
print(report)
```

### Exercise 4: End-to-End Clustering Pipeline

Perform clustering analysis on a synthetic customer dataset with evaluation.

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

np.random.seed(42)
customers = pd.DataFrame({
    'annual_income': np.append(
        np.random.normal(55, 15, 200).clip(15, 150),
        np.random.normal(120, 30, 50).clip(80, 200)
    ),
    'spending_score': np.append(
        np.random.uniform(10, 60, 200),
        np.random.uniform(60, 100, 50)
    ),
    'age': np.random.normal(40, 12, 250).astype(int).clip(18, 70),
    'membership_years': np.random.exponential(3, 250).round(1),
})

# TODO:
# 1. Standardize the features
# 2. Use PCA to reduce to 2 dimensions for visualization
# 3. Apply the elbow method to find optimal k (range 2-8)
# 4. Fit KMeans with optimal k on the 2D PCA data
# 5. Calculate silhouette score
# 6. Create a scatter plot colored by cluster with centroids marked
# 7. Profile each cluster (mean values of original features)

def cluster_customers(df):
    """Complete the clustering pipeline. Return the DataFrame with a 'cluster' column."""
    # Your code here
    pass
```

### Exercise 5: Data Cleaning and Feature Engineering Challenge

Write a reusable data cleaning function that handles real-world messiness.

```python
import pandas as pd
import numpy as np

def create_messy_dataset():
    """Create a realistic messy dataset for testing."""
    np.random.seed(42)
    n = 500
    return pd.DataFrame({
        'customer_id': list(range(1, n + 1)),
        'name': np.random.choice(['  Alice Smith', 'alice smith', 'ALICE SMITH',
                                   'Bob Jones', '  bob  jones  ', None], n),
        'email': np.random.choice(['alice@test.com', 'BOB@TEST.COM', 'invalid-email',
                                    None, 'charlie@test.com'], n),
        'age': np.random.choice(
            np.append(np.random.normal(35, 10, n - 5).astype(int), [200, -5, 0, 150, 999])
        ),
        'purchase_amount': np.random.lognormal(3, 1, n).round(2).tolist() + [None] * 0,
        'purchase_date': np.random.choice(
            ['2024-01-15', '01/15/2024', 'Jan 15, 2024', '2024/15/01', None], n
        ),
        'category': np.random.choice(
            ['Electronics', 'electronics', 'ELECTRONICS', 'Clothing', 'clothing',
             'Food & Beverage', 'food & beverage'], n
        ),
        'is_active': np.random.choice([True, False, 'Yes', 'No', 1, 0, None], n),
    })

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Implement a complete data cleaning function:
    1. Standardize all string columns (strip, consistent case)
    2. Parse dates into a consistent datetime format
    3. Handle missing values appropriately per column type
    4. Remove or cap outliers in numeric columns
    5. Standardize categorical values
    6. Validate email format and flag invalid ones
    7. Convert 'is_active' to a consistent boolean
    8. Add data quality summary as print output
    """
    # Your code here
    pass

messy = create_messy_dataset()
clean = clean_dataset(messy)
print(f"Original shape: {messy.shape}")
print(f"Cleaned shape: {clean.shape}")
print(clean.dtypes)
```

---

*In the next chapter, we'll explore **Web Development with Python** — building APIs with FastAPI, serving web applications, and connecting your data science models to real-world user interfaces.*
