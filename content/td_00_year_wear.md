# wear

Estimativa de emissoes por desgaste de pneus, freios e rodagem.

```r
# Evaporative

# Tyres, Breaks and Road
language <- "english" #portuguese english spanish
metadata <- readRDS("config/metadata.rds")
mileage <- readRDS("config/mileage.rds")
tfs <- readRDS("config/tfs.rds")
veh <- readRDS("config/fleet_age.rds")
pmonth <- readRDS("config/pmonth.rds")
pol <- c("PM2.5", "PM10")
verbose <- FALSE
maxage <- 40
source("scripts/wear.R", encoding = "UTF-8")
rm(list = ls())
gc()

```

o conteudo do script wear.R é o seguinte.

Aqui se calcula as emissões por desgaste de pneus, freios e rodagem para todos os veiculos. Para os difentes cenarios de temperatura.

```r
suppressWarnings(file.remove("emi/wear.csv"))

year_select <- as.numeric(substr(
  x = getwd(),
  start = nchar(getwd()) - 3,
  stop = nchar(getwd())
))


switch(
  language,
  "portuguese" = cat("Estimando emissões\n"),
  "english" = cat("Estimating emissions\n"),
  "spanish" = cat("Estimando emisiones\n")
)


# Wear ####
wear <- c("tyre", "break", "road")

reg <- unique(veh$region)

for (rr in seq_along(reg)) {
  for (i in seq_along(metadata$vehicles)) {
    cat(
      "\n",
      metadata$vehicles[i],
      rep("", max(nchar(metadata$vehicles) + 1) - nchar(metadata$vehicles[i]))
    )

    x <- readRDS(paste0("veh/", metadata$vehicles[i], ".rds"))
    x <- as.data.frame(x)
    x[is.na(x)] <- 0

    for (j in seq_along(pol)) {
      cat(" ", pol[j], " ")

      for (k in seq_along(wear)) {
        cat(wear[k], " ")

        ef <- ef_wear(
          wear = wear[k],
          type = metadata$family[i],
          pol = pol[j],
          speed = metadata$speed[i]
        )

        ef <- rep(ef[[1]], ncol(x))

        dm <- pmonth[
          region == reg[rr] &
            fuel == metadata$fuel[i]
        ]$m3

        array_x <- emis_hot_td(
          veh = x[x$region == reg[[rr]], 1:maxage],
          lkm = mileage[[metadata$vehicles[i]]],
          ef = ef[1:maxage],
          pro_month = as.numeric(dm),
          fortran = TRUE,
          nt = check_nt() * 0.9,
          verbose = verbose,
          params = list(
            veh = metadata$vehicles[i],
            size = metadata$size[i],
            fuel = metadata$fuel[i],
            pollutant = pol[j],
            type_emi = "Wear",
            subtype_emi = wear[k],
            baseyear = year_select
          )
        )

        array_x$region <- reg[rr]

        fwrite(array_x, "emi/wear.csv", append = TRUE)
      }
    }
    rm(array_x, ef)
    gc()
  }
}


switch(
  language,
  "portuguese" = message("\n\nArquivos em: /emi/*:"),
  "english" = message("\nFiles in: /emi/*"),
  "spanish" = message("\nArchivos en: /emi/*")
)


switch(
  language,
  "portuguese" = message("Limpando..."),
  "english" = message("Cleaning..."),
  "spanish" = message("Limpiando...")
)

suppressWarnings(
  rm(
    i,
    j,
    pol,
    n_PC,
    n_LCV,
    n_TRUCKS,
    n_BUS,
    n_MC,
    ns,
    ln,
    p,
    df,
    dl,
    cores
  )
)

gc()

```
