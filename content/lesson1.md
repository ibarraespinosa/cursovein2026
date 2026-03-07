# Module 1: Introduction to VEIN

Welcome to the **first lesson** of the VEIN course. In this lesson, we will explore what the **VEIN** R package is and how to get started.

## What is VEIN?

VEIN (Vehicular Emissions Inventories) is an R package developed to estimate vehicular emissions comprehensively. It covers bottom-up modeling:

- Input of precise spatial traffic data (`sf` class)
- Linking of temporal matrices to traffic segments
- Estimating emission factors based on fuel, technology, and local definitions
- Calculating emissions dynamically

## Installation

To start, you need to install the package from CRAN. 

```r
# Install from CRAN
install.packages("vein")

# Alternatively, install development version from GitHub
# install.packages("devtools")
# devtools::install_github("atmoschem/vein")
```

Once installed, simply call:

```r
library(vein)
packageVersion("vein")
```

## Basic Structure

Compiling an inventory includes several sequential steps inside VEIN:

1. **Traffic Modeling:** Prepare a road network explicitly.
2. **Speed Distribution:** Associate speed data to vehicles on each link.
3. **Vehicle Fleet:** Specify ages, use, and degradation of vehicles.
4. **Emission Factors:** Select appropriate equations or tables representing emissions (e.g., CETESB data for Brazil).
5. **Emissions:** Calculate precise outputs in mass units.
6. **Gridding:** Aggregate results to spatial units for atmospheric modeling.

### Example Plotting Emissions

VEIN provides easy-to-use methods for plotting:

```r
data(net)
# We can examine the spatial lines
plot(net["capacity"], main="Road Network Capacity")
```

## Next Steps

In the next lesson, we will dive deep into **Traffic Modeling** and matrix ingestion.

> **Note:** To update this content, simply modify the `content/lesson1.md` file!
