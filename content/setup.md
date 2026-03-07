# Installation & Setup

## Prerequisites

To use VEIN and follow this course, you will need the following installed:

* R (download from [CRAN](https://cran.r-project.org/))
* RStudio (download from [Posit](https://posit.co/download/rstudio-desktop/))

## Required Packages

To begin the course, make sure to install all the spatial libraries that VEIN relies upon.

```R
install.packages(c("sf", "stars", "units", "lwgeom"))
```

Then install VEIN from GitHub or CRAN:

```R
install.packages("remotes")
remotes::install_github("atmoschem/vein")
```

Verify your installation:

```R
library(vein)
packageVersion("vein")
```

Once you have verified the installation, you are ready to begin the **Introduction to VEIN** lesson.
