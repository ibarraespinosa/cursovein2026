# fuel_eval

Calirbacao da atividade com as vendas de combustivel por estado.

```r

# 3) Estimation ####
language <- "portuguese" # english chinese spanish portuguese
metadata <- readRDS("config/metadata.rds")
mileage <- readRDS("config/mileage.rds")
veh <- readRDS("config/fleet_age.rds")
# net <- readRDS("network/net.rds")
pmonth <- readRDS("config/pmonth.rds")
met <- readRDS("config/met.rds")
verbose <- FALSE
maxage <- 40

# fuel calibration with fuel consumption data
fuel <- readRDS("config/fuel.rds")
pol <- "FC"
source("scripts/fuel_eval.R", encoding = "UTF-8")
rm(list = ls())
gc()

```

o conteudo do script fuel_eval.R é o seguinte:

```r

 year <- as.numeric(substr(
  x = getwd(),
  start = nchar(getwd()) - 3,
  stop = nchar(getwd())
))

year_selected <- year

# year_selected <- 2000
```

Aqui primeiro estamos o consumo de combustivel inicial

```r
suppressWarnings(file.remove("emi/FC_INITIAL.csv"))

reg <- unique(veh$region)

# Exhaust ####
for (k in seq_along(reg)) {
  cat(reg[k], " ")

  for (i in seq_along(metadata$vehicles)) {
    # cat("\n", metadata$vehicles[i],
    #     rep("", max(nchar(metadata$vehicles) + 1) - nchar(metadata$vehicles[i])))

    x <- readRDS(paste0("veh/", metadata$vehicles[i], ".rds"))

    x[is.na(x)] <- 0

    x <- x[region == reg[k], ]

    x$region <- NULL

    setDF(x)

    dm <- pmonth[
      region == reg[k] &
        fuel == metadata$fuel[i]
    ]$consumption_t

    for (j in seq_along(pol)) {
      # cat(pol[j])

      ef <- ef_cetesb(
        p = pol[j],
        veh = metadata$vehicles[i],
        year = year_selected,
        agemax = ncol(x),
        verbose = verbose
      )

      array_x <- emis_hot_td(
        veh = x,
        lkm = mileage[[metadata$vehicles[i]]],
        ef = ef,
        fortran = TRUE,
        pro_month = dm,
        verbose = verbose,
        params = list(
          veh = metadata$vehicles[i],
          size = metadata$size[i],
          fuel = metadata$fuel[i],
          pollutant = pol[j],
          type_emi = "Exhaust",
          subtype_emi = "Exhaust",
          baseyear = year_selected
        )
      )

      array_x$region <- reg[k]

      fwrite(array_x, "emi/FC_INITIAL.csv", append = TRUE)
    }
  }
}
cat("\n")

switch(
  language,
  "portuguese" = message("\nArquivos em:"),
  "english" = message("\nFiles in:"),
  "spanish" = message("\nArchivos en:")
)

cat(paste0(getwd(), "/emi/*\n"))


# data.table ####
dt <- fread("emi/FC_INITIAL.csv")

dt$pollutant <- as.character(dt$pollutant)
dt$g <- units::set_units(dt$emissions, "g")
dt$t <- units::set_units(dt$g, t)

dt0 <- dt[pollutant == "FC", round(sum(t, na.rm = T), 2), by = .(fuel, region)]

# data.table::setkey(dt0, c("fuel", "region"))

names(dt0)[3] <- "estimation_t"
dtf <- merge(dt0, fuel, by = c("fuel", "region"))
dtf$estimation_consumption <- dtf$estimation_t / dtf$consumption_t
print(dtf[, c(
  "region",
  "fuel",
  "estimation_t",
  "consumption_t",
  "estimation_consumption"
)])

dtf$kfinal <- as.numeric(1 / dtf$estimation_consumption)

dtf$kfinal[is.na(dtf$kfinal)] <- 1

dtf$kfinal[is.infinite(dtf$kfinal)] <- 1
fwrite(dtf, "config/kfuel.csv")

```

Agora vamos aplicar o fator de correção na frota

```r
# 2) Traffic ####
language <- "english" # spanish portuguese
metadata <- readRDS("config/metadata.rds")
categories <- c("pc", "lcv", "trucks", "bus", "mc") # in network/net.gpkg
veh <- readRDS("config/fleet_age.rds")
verbose <- FALSE
theme <- "black" # dark clean ink
survival <- TRUE
fuel <- dtf
maxage <- 40
source("scripts/trafficfuel.R", encoding = "UTF-8", echo = FALSE)

# Re estimating FC ####
suppressWarnings(file.remove("emi/FC_ADJUSTED.csv"))

switch(
  language,
  "portuguese" = message("\nEstimando consumo de combustivel:"),
  "english" = message("\nEstimating fuel consumption"),
  "spanish" = message("\nEstimando consumo de combustible")
)


# Exhaust ####
for (k in seq_along(reg)) {
  cat(reg[k], " ")

  for (i in seq_along(metadata$vehicles)) {
    # cat("\n", metadata$vehicles[i],
    #     rep("", max(nchar(metadata$vehicles) + 1) - nchar(metadata$vehicles[i])))

    x <- readRDS(paste0("veh/", metadata$vehicles[i], ".rds"))

    x[is.na(x)] <- 0
    x <- x[region == reg[k], ]

    x$region <- NULL

    setDF(x)

    dm <- pmonth[
      region == reg[k] &
        fuel == metadata$fuel[i]
    ]$consumption_t

    for (j in seq_along(pol)) {
      # cat(pol[j])

      ef <- ef_cetesb(
        p = pol[j],
        veh = metadata$vehicles[i],
        year = year_selected,
        agemax = ncol(x),
        verbose = verbose
      )

      array_x <- emis_hot_td(
        veh = x,
        lkm = mileage[[metadata$vehicles[i]]],
        ef = ef,
        fortran = TRUE,
        pro_month = dm,
        verbose = verbose,
        params = list(
          veh = metadata$vehicles[i],
          size = metadata$size[i],
          fuel = metadata$fuel[i],
          pollutant = pol[j],
          type_emi = "Exhaust",
          subtype_emi = "Exhaust",
          baseyear = year_selected
        )
      )

      array_x$region <- reg[k]

      fwrite(array_x, "emi/FC_ADJUSTED.csv", append = TRUE)
    }
  }
}

```

Agora vamos comparar os resultados

```r
cat("\n")

# data.table ####
dt <- fread("emi/FC_ADJUSTED.csv")
fuel <- readRDS("config/fuel.rds")

dt$pollutant <- as.character(dt$pollutant)
dt$g <- units::set_units(dt$emissions, "g")
dt$t <- units::set_units(dt$g, t)

dt0 <- dt[pollutant == "FC", round(sum(t), 2), by = .(fuel, region)]

# data.table::setkey(dt0, c("fuel", "region"))

names(dt0)[3] <- "estimation_t"
dtf <- merge(dt0, fuel, by = c("fuel", "region"))

dtf$estimation_consumption <- dtf$estimation_t / dtf$consumption_t
print(dtf[, c(
  "region",
  "fuel",
  "estimation_t",
  "consumption_t",
  "estimation_consumption"
)])

switch(
  language,
  "portuguese" = message("Limpando..."),
  "english" = message("Cleaning..."),
  "spanish" = message("Limpiando...")
)


```

Vamos ver a comparacao

```
    region   fuel    estimation_t consumption_t estimation_consumption
    <char> <char>         <units>         <num>                <units>
 1:     AC      D   127592.91 [t]  1.275929e+05          1.0000000 [t]
 2:     AL      D   299635.55 [t]  2.996356e+05          1.0000000 [t]
 3:     AM      D   932247.69 [t]  9.322477e+05          1.0000000 [t]
 4:     AP      D    80585.78 [t]  8.058578e+04          1.0000000 [t]
 5:     BA      D  2597743.84 [t]  2.597744e+06          1.0000000 [t]
 6:     CE      D   857571.67 [t]  8.575717e+05          1.0000000 [t]
 7:     DF      D   307772.57 [t]  3.077726e+05          1.0000000 [t]
 8:     ES      D   949243.42 [t]  9.492434e+05          1.0000000 [t]
 9:     GO      D  2256202.45 [t]  2.256202e+06          1.0000000 [t]
10:     MA      D  1171709.97 [t]  1.171710e+06          1.0000000 [t]
11:     MG      D  5709838.37 [t]  5.709838e+06          1.0000000 [t]
12:     MS      D  1128520.30 [t]  1.128520e+06          1.0000000 [t]
13:     MT      D  2385572.39 [t]  2.385572e+06          1.0000000 [t]
14:     PA      D  1930860.25 [t]  1.930860e+06          1.0000000 [t]
15:     PB      D   362774.51 [t]  3.627745e+05          1.0000000 [t]
16:     PE      D  1126972.94 [t]  1.126973e+06          1.0000000 [t]
17:     PI      D   434457.59 [t]  4.344576e+05          1.0000000 [t]
18:     PR      D  4607251.92 [t]  4.607252e+06          1.0000000 [t]
19:     RJ      D  1915390.38 [t]  1.915390e+06          1.0000000 [t]
20:     RN      D   374325.63 [t]  3.743256e+05          1.0000000 [t]
21:     RO      D   723579.79 [t]  7.235798e+05          1.0000000 [t]
22:     RR      D   140467.13 [t]  1.404671e+05          1.0000000 [t]
23:     RS      D  2992616.98 [t]  2.992617e+06          1.0000000 [t]
24:     SC      D  2066316.52 [t]  2.066317e+06          1.0000000 [t]
25:     SE      D   263621.48 [t]  2.636215e+05          1.0000000 [t]
26:     SP      D 10174673.21 [t]  1.017467e+07          1.0000000 [t]
27:     TO      D   811207.18 [t]  8.112072e+05          1.0000000 [t]
28:     AC      E     6903.51 [t]  6.903513e+03          0.9999996 [t]
29:     AL      E    62758.28 [t]  6.275828e+04          1.0000000 [t]
30:     AM      E    73239.52 [t]  7.323952e+04          1.0000001 [t]
31:     AP      E      751.14 [t]  7.511444e+02          0.9999942 [t]
32:     BA      E   405533.20 [t]  4.055332e+05          1.0000000 [t]
33:     CE      E   137296.23 [t]  1.372962e+05          1.0000000 [t]
34:     DF      E   135612.17 [t]  1.356122e+05          1.0000000 [t]
35:     ES      E    42921.19 [t]  4.292119e+04          1.0000000 [t]
36:     GO      E  1226901.04 [t]  1.226901e+06          1.0000000 [t]
37:     MA      E    30175.07 [t]  3.017507e+04          1.0000000 [t]
38:     MG      E  2013046.79 [t]  2.013047e+06          1.0000000 [t]
39:     MS      E   107904.20 [t]  1.079042e+05          1.0000000 [t]
40:     MT      E   680063.82 [t]  6.800638e+05          1.0000000 [t]
41:     PA      E    43400.76 [t]  4.340076e+04          0.9999999 [t]
42:     PB      E   133633.92 [t]  1.336339e+05          1.0000000 [t]
43:     PE      E   301194.65 [t]  3.011947e+05          1.0000000 [t]
44:     PI      E    58476.99 [t]  5.847699e+04          1.0000000 [t]
45:     PR      E  1266960.67 [t]  1.266961e+06          1.0000000 [t]
46:     RJ      E   603798.19 [t]  6.037982e+05          1.0000000 [t]
47:     RN      E    81683.49 [t]  8.168349e+04          1.0000000 [t]
48:     RO      E    12652.77 [t]  1.265277e+04          1.0000002 [t]
49:     RR      E     1618.00 [t]  1.618000e+03          1.0000000 [t]
50:     RS      E    55992.85 [t]  5.599285e+04          1.0000001 [t]
51:     SC      E    77910.51 [t]  7.791051e+04          1.0000000 [t]
52:     SE      E    39184.48 [t]  3.918448e+04          0.9999999 [t]
53:     SP      E  8055019.90 [t]  8.055020e+06          1.0000000 [t]
54:     TO      E    27604.47 [t]  2.760447e+04          1.0000002 [t]
55:     AC      G   100973.20 [t]  1.009732e+05          1.0000000 [t]
56:     AL      G   315064.34 [t]  3.150643e+05          1.0000000 [t]
57:     AM      G   463244.76 [t]  4.632448e+05          1.0000000 [t]
58:     AP      G   119179.19 [t]  1.191792e+05          1.0000000 [t]
59:     BA      G  1516623.00 [t]  1.516623e+06          1.0000000 [t]
60:     CE      G  1002978.35 [t]  1.002978e+06          1.0000000 [t]
61:     DF      G   822728.83 [t]  8.227288e+05          1.0000000 [t]
62:     ES      G   686099.80 [t]  6.860998e+05          1.0000000 [t]
63:     GO      G   922501.32 [t]  9.225013e+05          1.0000000 [t]
64:     MA      G   711528.03 [t]  7.115280e+05          1.0000000 [t]
65:     MG      G  2694720.25 [t]  2.694720e+06          1.0000000 [t]
66:     MS      G   537544.08 [t]  5.375441e+05          1.0000000 [t]
67:     MT      G   393610.85 [t]  3.936108e+05          1.0000000 [t]
68:     PA      G   857241.13 [t]  8.572411e+05          1.0000000 [t]
69:     PB      G   481051.66 [t]  4.810517e+05          1.0000000 [t]
70:     PE      G   988925.58 [t]  9.889256e+05          1.0000000 [t]
71:     PI      G   420616.44 [t]  4.206164e+05          1.0000000 [t]
72:     PR      G  1912607.49 [t]  1.912607e+06          1.0000000 [t]
73:     RJ      G  1509709.09 [t]  1.509709e+06          1.0000000 [t]
74:     RN      G   458651.22 [t]  4.586512e+05          1.0000000 [t]
75:     RO      G   322645.20 [t]  3.226452e+05          1.0000000 [t]
76:     RR      G   106325.53 [t]  1.063255e+05          1.0000000 [t]
77:     RS      G  2610459.86 [t]  2.610460e+06          1.0000000 [t]
78:     SC      G  2074348.10 [t]  2.074348e+06          1.0000000 [t]
79:     SE      G   279160.03 [t]  2.791600e+05          1.0000000 [t]
80:     SP      G  6355078.52 [t]  6.355079e+06          1.0000000 [t]
81:     TO      G   263213.65 [t]  2.632136e+05          1.0000000 [t]
    region   fuel    estimation_t consumption_t estimation_consumption
    <char> <char>         <units>         <num>                <units>

```
