# config.R

```
options(encoding = "UTF-8")
library(vein) # vein
library(sf) # spatial data
library(cptcity) # 7120 colour palettes
library(ggplot2) # plots
library(eixport) # WRF Chem
library(data.table) # blasting speed
library(units)
sessionInfo()

# 0 Configuration

language <- "portuguese" # english spanish
path <- "config/inventory.xlsx"
readxl::excel_sheets(path) # For libre office, readODS::read_ods()
metadata <- readxl::read_xlsx(path = path, sheet = "metadata")
mileage <- readxl::read_xlsx(path = path, sheet = "mileage")
tfs <- readxl::read_xlsx(path = path, sheet = "tfs")
veh <- readxl::read_xlsx(path = path, sheet = "fleet_age")
fuel <- readxl::read_xlsx(path = path, sheet = "fuel")
met <- readxl::read_xlsx(path = path, sheet = "met")
s <- readxl::read_xlsx(path = path, sheet = "s")
im_ok <- readxl::read_xlsx(path = path, sheet = "im_ok")
im_co <- readxl::read_xlsx(path = path, sheet = "im_co")
im_hc <- readxl::read_xlsx(path = path, sheet = "im_hc")
im_nox <- readxl::read_xlsx(path = path, sheet = "im_nox")
im_pm <- readxl::read_xlsx(path = path, sheet = "im_pm")
year <- 2018
theme <- "black" # dark clean ink
scale <- "default"
delete_directories <- TRUE
source("config/config.R", encoding = "UTF-8")
rm(list = ls())
gc()

```

A confiuracao do inventario estao no arquivo excel config/inventory.xlsx, com as seguintes folhas:

- **metadata**: Metadata
- **fleet_age**: Frota por ano e tipo de veiculo.
- **tfs**: Inclui fatores de expansao temporal.
- **mileage**: Inclui o quilometragem dos veiculos.
- **fuel**: Inclui as vendas de combustivel.
- **met**: Inclui informacao meteorologica.
- **s**: Inclui as informacoes de enxofre.
- **im_ok**: Inclui a percentagem dos veiculos que passariam uma inspeção veicular. Para detalhes da metodologia, por favor ver [Ibarra-Espinosa et al., 2026](https://www.mdpi.com/2073-4433/17/1/31).
- **im_co**: Inclui a razao entre os veiuclos reprovando/aprovando.
- **im_hc**: Inclui a razao entre os veiuclos reprovando/aprovando.
- **im_nox**: Inclui a razao entre os veiuclos reprovando/aprovando.
- **im_pm**: Inclui a razao entre os veiuclos reprovando/aprovando.

A metadata inclui as definicoes dos tipos de veiculos. Embaixo voce pode ver a metadata. Aqui tem varios parametros como descripcao dos veiculos, viagems promedio por dia para calcular as emissoes evaporativas, ciclo de conducao, e parametros de sobreviencia.

![](content/metadata1.png)

## Rodando o arquivo

No codigo abaixo, voce pode ver a configuracao do inventario. Primeiro lemos as folhas do arquivo metadata e transformamos em data.frame.

```
# apagando dados ####
a <- list.files(path = "config", pattern = ".rds", full.names = T)
file.remove(a)


# configuracao ####
metadata <- as.data.frame(metadata)
mileage <- as.data.frame(mileage)
mileage[, metadata$vehicles] <- add_lkm(mileage[, metadata$vehicles])
tfs <- as.data.frame(tfs)
veh <- as.data.frame(veh)
fuel <- as.data.frame(fuel)
met <- as.data.frame(met)
s <- as.data.frame(s)


im_ok <- as.data.frame(im_ok)
im_co <- as.data.frame(im_co)
im_nox <- as.data.frame(im_nox)
im_hc <- as.data.frame(im_hc)
im_pm <- as.data.frame(im_pm)
```

Aqui sao mostrados os tipos de veiculos e se conferem a integridade da metadata. Logo sao salvados os arqiuivos em formato RDS.

```

# checkar metadata$vehicles ####
switch(language,
       "portuguese" = cat("Metadata$Vehicles é:\n"),
       "english" = cat("Metadata$Vehicles is:\n"),
       "spanish" = cat("Metadata$Vehicles es:\n")
)

# cat( "Metadata$Vehicles é:\n")
print(metadata$vehicles)

# checar nomes mileage ####
if (!length(intersect(metadata$vehicles, names(mileage))) == length(metadata$vehicles)) {
  switch(language,
         "portuguese" = stop(
           "Precisa adicionar coluna ",
           setdiff(metadata$vehicles, names(mileage)),
           " em `mileage`"
         ),
         "english" = stop(
           "You need to add column ",
           setdiff(metadata$vehicles, names(mileage)),
           " in `mileage`"
         ),
         "spanish" = stop(
           "Necesitas agregar la columna ",
           setdiff(metadata$vehicles, names(mileage)),
           " en `mileage`"
         )
  )
}

# checar nomes tfs ####
if (!length(intersect(metadata$vehicles, names(tfs))) == length(metadata$vehicles)) {
  switch(language,
         "portuguese" = stop(
           "Precisa adicionar coluna ",
           setdiff(metadata$vehicles, names(mileage)),
           " em `tfs`"
         ),
         "english" = stop(
           "You need to add column ",
           setdiff(metadata$vehicles, names(mileage)),
           " in `tfs`"
         ),
         "spanish" = stop(
           "Necesitas agregar la columna ",
           setdiff(metadata$vehicles, names(mileage)),
           " en `tfs`"
         )
  )
}

# checar nomes veh ####
if (!length(intersect(metadata$vehicles, names(veh))) == length(metadata$vehicles)) {
  switch(language,
         "portuguese" = stop(
           "Precisa adicionar coluna ",
           setdiff(metadata$vehicles, names(mileage)),
           " em `veh`"
         ),
         "english" = stop(
           "You need to add column ",
           setdiff(metadata$vehicles, names(mileage)),
           " in `veh`"
         ),
         "spanish" = stop(
           "Necesitas agregar la columna ",
           setdiff(metadata$vehicles, names(mileage)),
           " en `veh`"
         )
  )
}

# checar Year ####
if (!"Year" %in% names(veh)) {
  switch(language,
         "portuguese" = stop("Não estou enxergando a coluna 'Year' em `veh`"),
         "english" = stop("I'm not seeing column 'Year' in `veh`"),
         "spanish" = stop("No estoy viendo la columna 'Year' in `veh`")
  )
}
if (!"Year" %in% names(mileage)) {
  switch(language,
         "portuguese" = stop("Não estou enxergando a coluna 'Year' em `mileage`"),
         "english" = stop("I'm not seeing column 'Year' in `mileage`"),
         "spanish" = stop("No estoy viendo la columna 'Year' in `mileage`")
  )
}

# checar ano base
if (veh$Year[1] != year) {
  switch(language,
         "portuguese" = stop(paste0("O ano base é ", year, " mas o primeiro ano em `veh` é ", veh$Year[1])),
         "english" = stop(paste0("The base year is ", year, " but the first year in `veh` is ", veh$Year[1])),
         "spanish" = stop(paste0("El año base es ", year, " pero el primer año de `veh` es ", veh$Year[1]))
  )
}
if (mileage$Year[1] != year) {
  switch(language,
         "portuguese" = stop(paste0("O ano base é ", year, " mas o primeiro ano em `mileage` é ", mileage$Year[1])),
         "english" = stop(paste0("The base year is ", year, " but the first year in `mileage` is ", veh$Year[1])),
         "spanish" = stop(paste0("El año base es ", year, " pero el primer año de `mileage` es ", mileage$Year[1]))
  )
}


switch(language,
       "portuguese" = message("Arquivos em: ", getwd(), "/config/*\n"),
       "english" = message("Files in: ", getwd(), "/config/*\n"),
       "spanish" = message("Archivos en: ", getwd(), "/config/*\n")
)

saveRDS(metadata, "config/metadata.rds")
saveRDS(mileage, "config/mileage.rds")
saveRDS(tfs, "config/tfs.rds")
saveRDS(veh, "config/fleet_age.rds")
saveRDS(fuel, "config/fuel.rds")
saveRDS(met, "config/met.rds")
saveRDS(s, "config/s.rds")


saveRDS(im_ok, "config/im_ok.rds")
saveRDS(im_co, "config/im_co.rds")
saveRDS(im_hc, "config/im_hc.rds")
saveRDS(im_nox, "config/im_nox.rds")
saveRDS(im_pm, "config/im_pm.rds")
```

Aqui sao criados e apagados se for o caso todas as patas a serem criadas. Isto serve para novas rodadas com a mesma configuracao.

```


# pastas
if (delete_directories) {
  choice <- 1

  if (language == "portuguese") {
    # choice <- utils::menu(c("Sim", "Não"), title="Apagar pastas csv, emi, images, notes, post e veh??")
    if (choice == 1) {
      message("Apagando pastas `emi`, `images`, `notes`, `post` e `veh`")
      unlink("csv", recursive = T)
      unlink("emi", recursive = T)
      unlink("images", recursive = T)
      unlink("notes", recursive = T)
      unlink("post", recursive = T)
      unlink("veh", recursive = T)
    }
  } else if (language == "english") {
    # choice <- utils::menu(c("Yes", "No"), title="Delete folders `csv`, `emi`, `images`, `notes`, `post` e `veh`??")
    if (choice == 1) {
      message("Deleting folders `emi`, `images`, `notes`, `post` and `veh`")
      unlink("csv", recursive = T)
      unlink("emi", recursive = T)
      unlink("images", recursive = T)
      unlink("notes", recursive = T)
      unlink("post", recursive = T)
      unlink("veh", recursive = T)
    }
  } else if (language == "spanish") {
    # choice <- utils::menu(c("Si", "No"), title="Borrar carpetas `csv`, `emi`, `images`, `notes`, `post` y `veh`??")
    if (choice == 1) {
      message("Borrando carpetas `emi`, `images`, `notes`, `post` y `veh`")
      unlink("csv", recursive = T)
      unlink("emi", recursive = T)
      unlink("notes", recursive = T)
      unlink("images", recursive = T)
      unlink("post", recursive = T)
      unlink("veh", recursive = T)
    }
  }
}

dir.create(path = "csv", showWarnings = FALSE)
dir.create(path = "emi", showWarnings = FALSE)
dir.create(path = "images", showWarnings = FALSE)
dir.create(path = "notes", showWarnings = FALSE)
dir.create(path = "post", showWarnings = FALSE)
dir.create(path = "post/datatable", showWarnings = FALSE)
dir.create(path = "post/streets", showWarnings = FALSE)
dir.create(path = "post/grids", showWarnings = FALSE)
dir.create(path = "veh", showWarnings = FALSE)

# for (i in seq_along(metadata$vehicles)) dir.create(path = paste0("emi/", metadata$vehicles[i]))


pa <- list.dirs(path = "emi", full.names = T, recursive = T)
po <- list.dirs("post", full.names = T, recursive = T)

switch(language,
       "portuguese" = message("Novas pastas:"),
       "english" = message("New folders:"),
       "spanish" = message("Nuevas carpetas")
)

message("csv\n")
message("images\n")
message(paste0(po, "\n"))
message(paste0(pa, "\n"))
message("veh\n")
```

Aqui sao conferidos os nomes das categorias e agrupados em familia:

**PC**: Passenger Car
**LCV**: Light Commercial Vehicle
**TRUCKS**: Trucks
**BUS**: Bus
**MC**: Motorcycle

A funcao [colplot](https://atmoschem.github.io/vein/reference/colplot.html) plota os valores das colunas.

```
# names groups ####
n_PC <- metadata$vehicles[grep(pattern = "PC", x = metadata$vehicles)]
n_LCV <- metadata$vehicles[grep(pattern = "LCV", x = metadata$vehicles)]
n_TRUCKS <- metadata$vehicles[grep(pattern = "TRUCKS", x = metadata$vehicles)]
n_BUS <- metadata$vehicles[grep(pattern = "BUS", x = metadata$vehicles)]
n_MC <- metadata$vehicles[grep(pattern = "MC", x = metadata$vehicles)]
n_veh <- list(
  PC = n_PC,
  LCV = n_LCV,
  TRUCKS = n_TRUCKS,
  BUS = n_BUS,
  MC = n_MC
)
# Fuel ####
switch(language,
       "portuguese" = cat("Plotando combustivel \n"),
       "english" = cat("Plotting fuel \n"),
       "spanish" = cat("Plotando combustible \n")
)

png("images/FUEL.png", width = 1500, height = 2000, units = "px", res = 300)
barplot(
  height = fuel$consumption_lt,
  names.arg = fuel$fuel, xlab = "Fuel",
  ylab = "lt",
  main = "Fuel"
)
dev.off()

```

Aqui o plot de FUEL

![](content/FUEL.png)

```
# Fleet ####
switch(language,
       "portuguese" = cat("Plotando frota \n"),
       "english" = cat("Plotting fleet \n"),
       "spanish" = cat("Plotando flota \n")
)

for (i in seq_along(n_veh)) {
  df_x <- veh[, n_veh[[i]]]
  png(
    paste0(
      "images/FLEET_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "veh/h",
    main = names(n_veh)[i],
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}

```

Agora vmaos ver o exemplo do plot the fleet

![](content/FLEET_PC.png)

```

# TFS ####

switch(language,
       "portuguese" = cat("Plotando perfis `tfs`\n"),
       "english" = cat("Plotting profiles `tfs`\n"),
       "spanish" = cat("Plotando perfiles `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- tfs[, n_veh[[i]]]
  png(
    paste0(
      "images/TFS_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Hour",
    ylab = "",
    main = paste0("TFS ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}
```

Agora vmaos ver o exemplo do plot the TFS

![](content/TFS_PC.png)

```


# IM ####

switch(language,
       "portuguese" = cat("Plotando IM OK `tfs`\n"),
       "english" = cat("Plotting IM OK `tfs`\n"),
       "spanish" = cat("Plotando IM OK `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- im_ok[, n_veh[[i]]]
  png(
    paste0(
      "images/IM_OK_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "",
    main = paste0("IM OK!  ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}
```

Agora vmaos ver o exemplo do plot the IM OK

![](content/IM_OK_PC.png)

```
# IM CO (reprov/Aprov) ####

switch(language,
       "portuguese" = cat("Plotando IM REP/APR CO `tfs`\n"),
       "english" = cat("Plotting IM REP/APR CO `tfs`\n"),
       "spanish" = cat("Plotando IM REP/APR CO `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- im_co[, n_veh[[i]]]
  png(
    paste0(
      "images/IM_REP_APR_CO_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "",
    main = paste0("REP/APR CO  ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}

```

Agora vmaos ver o exemplo do plot the IM CO

![](content/IM_REP_APR_CO_PC.png)

```
# IM HC (reprov/Aprov) ####

switch(language,
       "portuguese" = cat("Plotando IM REP/APR HC `tfs`\n"),
       "english" = cat("Plotting IM REP/APR HC `tfs`\n"),
       "spanish" = cat("Plotando IM REP/APR HC `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- im_hc[, n_veh[[i]]]
  png(
    paste0(
      "images/IM_REP_APR_HC_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "",
    main = paste0("REP/APR HC  ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}

# IM NOx (reprov/Aprov) ####

switch(language,
       "portuguese" = cat("Plotando IM REP/APR NOx `tfs`\n"),
       "english" = cat("Plotting IM REP/APR NOx `tfs`\n"),
       "spanish" = cat("Plotando IM REP/APR NOx `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- im_co[, n_veh[[i]]]
  png(
    paste0(
      "images/IM_REP_APR_NOx_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "",
    main = paste0("REP/APR NOx  ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}

# IM PM2.5 (reprov/Aprov) ####

switch(language,
       "portuguese" = cat("Plotando IM REP/APR PM2.5 `tfs`\n"),
       "english" = cat("Plotting REP/APR PM2.5 `tfs`\n"),
       "spanish" = cat("Plotando REP/APR PM2.5 `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- im_pm[, n_veh[[i]]]
  png(
    paste0(
      "images/IM_REP_APR_PM_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "",
    main = paste0("REP/APR PM ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}

```

Agora vmaos ver o exemplo do plot the MILEAGE

![](content/MILEAGE_PC.png)

```
# Mileage ####

switch(language,
       "portuguese" = cat("Plotando quilometragem \n"),
       "english" = cat("Plotting mileage `tfs`\n"),
       "spanish" = cat("Plotando kilometraje `tfs`\n")
)

for (i in seq_along(n_veh)) {
  df_x <- mileage[, n_veh[[i]]]
  png(
    paste0(
      "images/MILEAGE_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age of use",
    ylab = "[km/year]",
    main = paste0("Mileage ", names(n_veh)[i]),
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}
```

Agora vmaos ver o exemplo do plot the enxofre

![](content/S_PC.png)

```


# sulphur/enxofre ####
switch(language,
       "portuguese" = cat("Plotando enxofre (ppm) \n"),
       "english" = cat("Plotting sulfur (ppm) \n"),
       "spanish" = cat("Plotando azufre (ppm) \n")
)

for (i in seq_along(n_veh)) {
  df_x <- s[, n_veh[[i]]]

  png(
    paste0(
      "images/S_",
      names(n_veh)[i],
      ".png"
    ),
    2000, 1500, "px",
    res = 300
  )
  colplot(
    df = df_x,
    cols = n_veh[[i]],
    xlab = "Age",
    ylab = "S (ppm)",
    main = names(n_veh)[i],
    type = "l",
    pch = NULL,
    lwd = 1,
    theme = theme,
  )
  dev.off()
}
```

Agora vmaos ver o exemplo do plot the Temperature

![](content/Temperature.png)

```


# Temperature ####
units(celsius(1))$numerator
png("images/Temperature.png",
    2000, 1500, "px",
    res = 300
)
colplot(
  df = met,
  cols = "Temperature",
  xlab = "Months",
  ylab = units(celsius(1))$numerator,
  main = "Temperature",
  type = "l",
  pch = NULL,
  lwd = 1,
  theme = theme,
)
dev.off()
```

Finalmente aqui sao tomadas notas da maquina e inventario. Embaixo as notas do inventario

```
========================================
Metropolitan Area of São Paulo (MASP) 2018
========================================

Directory: /media/sergio/ext5/usp2025/brazil_bu

Local Time: 2026-03-10 14:18:27.979155
Inventory compiler: sergio
========================================

sysname = Linux
release = 6.17.0-14-generic
version = #14~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Thu Jan 15 15:52:10 UTC 2
nodename = sergio-GL63-9SD
machine = x86_64
user = sergio
R version = 4.3.3
nickname = Angel Food Cake
Memory used = 1616Mb
========================================

VEIN version = 1.7.0
========================================

Traffic:
Samples of travel demand models for MASP

Approach:
Bottom-up

Vehicular composition:
CETESB

Emission Factors:
CETESB default

Cold starts:
Not Applicable

Evaporative:
Running Losses, Diurnal and Hot Soak

Traffic standards:
PROCONVE, PROMOT

Traffic mileage:
Bruni and Bales 2013

Notes:
Default notes for vein::get_project
========================================

Session Info:
R version 4.3.3 (2024-02-29)
Platform: x86_64-pc-linux-gnu (64-bit)
Running under: Ubuntu 24.04.4 LTS

Matrix products: default
BLAS:   /usr/lib/x86_64-linux-gnu/openblas-pthread/libblas.so.3
LAPACK: /usr/lib/x86_64-linux-gnu/openblas-pthread/libopenblasp-r0.3.26.so;  LAPACK version 3.12.0

locale:
 [1] LC_CTYPE=en_US.UTF-8       LC_NUMERIC=C               LC_TIME=en_US.UTF-8        LC_COLLATE=en_US.UTF-8
 [5] LC_MONETARY=en_US.UTF-8    LC_MESSAGES=en_US.UTF-8    LC_PAPER=en_US.UTF-8       LC_NAME=C
 [9] LC_ADDRESS=C               LC_TELEPHONE=C             LC_MEASUREMENT=en_US.UTF-8 LC_IDENTIFICATION=C

time zone: America/New_York
tzcode source: system (glibc)

attached base packages:
[1] stats     graphics  grDevices utils     datasets  methods   base

other attached packages:
[1] data.table_1.18.2.1 eixport_0.6.3       ggplot2_4.0.0       cptcity_1.1.1       sf_1.1-0            vein_1.7.0

loaded via a namespace (and not attached):
 [1] gtable_0.3.6       dplyr_1.1.4        compiler_4.3.3     tidyselect_1.2.1   Rcpp_1.1.1         parallel_4.3.3
 [7] scales_1.4.0       readxl_1.4.5       lattice_0.22-5     R6_2.6.1           labeling_0.4.3     generics_0.1.4
[13] classInt_0.4-11    dotCall64_1.2      tibble_3.3.0       units_1.0-0        DBI_1.3.0          pillar_1.11.1
[19] RColorBrewer_1.1-3 rlang_1.1.7        sp_2.2-1           terra_1.9-1        S7_0.2.0           cli_3.6.5
[25] withr_3.0.2        magrittr_2.0.4     class_7.3-22       grid_4.3.3         ncdf4_1.24         lifecycle_1.0.5
[31] vctrs_0.6.5        KernSmooth_2.23-22 proxy_0.4-29       glue_1.8.0         cellranger_1.1.0   raster_3.6-32
[37] farver_2.1.2       codetools_0.2-19   e1071_1.7-17       tools_4.3.3        pkgconfig_2.0.3

========================================



Thanks for using VEIN
```

```

# Notes ####
switch(language,
       "portuguese" = cat("\nFazendo anotações\n"),
       "english" = cat("\nTaking some notes\n"),
       "spanish" = cat("\nEscribiendo notas\n")
)

vein_notes(
  notes = c("Default notes for vein::get_project"),
  file = "notes/README",
  title = paste0("Metropolitan Area of São Paulo (MASP) ", year),
  approach = "Bottom-up",
  traffic = "Samples of travel demand models for MASP",
  composition = "CETESB",
  ef = paste0("CETESB ", scale),
  cold_start = "Not Applicable",
  evaporative = "Running Losses, Diurnal and Hot Soak",
  standards = "PROCONVE, PROMOT",
  mileage = "Bruni and Bales 2013"
)
# saveRDS

switch(language,
       "portuguese" = message("\nArquivos em:"),
       "english" = message("\nFiles in:"),
       "spanish" = message("\nArchivos en:")
)

message(
  "config/metadata.rds\n",
  "config/mileage.rds\n",
  "config/tfs.rds\n",
  "config/fleet_age.rds\n",
  "config/fuel.rds\n"
)

switch(language,
       "portuguese" = message("\nFiguras em /images\n"),
       "english" = message("\nFigures in /image\n"),
       "spanish" = message("\nFiguras en /images\n")
)


switch(language,
       "portuguese" = message("\nAdicionando ano ", year, " e scale ", scale, " em:"),
       "english" = message("\nAdding year ", year, " amd scale ", scale, " in:"),
       "spanish" = message("\nAgregando año ", year, " y scale ", scale, " en:")
)

message(
  "scripts/exhaust.R\n",
  "scripts/evaporatives.R\n",
  "scripts/fuel_eval.R\n"
)

x <- c("scripts/exhaust.R",
       "scripts/evaporatives.R",
       "scripts/fuel_eval.R")

for(i in seq_along(x)) {
  file.copy(from = x[i],
            to = gsub("scripts/", "scripts/backup_", x[i]))
  l <- readLines(x[i])

  # year
  l <- gsub(pattern = "year = year",
            replacement = paste0("year = ", year),
            x = l)

  l <- gsub(pattern = "year <- year",
            replacement = paste0("year <- ", year),
            x = l)
  # scale
  l <- gsub(pattern = "scale = scale",
            replacement = paste0("scale = ", scale),
            x = l)

  l <- gsub(pattern = "scale <- scale",
            replacement = paste0("scale <- ", scale),
            x = l)
  # write
  writeLines(text = l, con = x[i])
}


switch(language,
       "portuguese" = message("Limpando..."),
       "english" = message("Cleaning..."),
       "spanish" = message("Limpiando...")
)

```
