# Frota

Aqui vamos rodar o main.R do projeto brazil_td. Este

Primeiro vamos ler o arquivo inventory.xlsx. Este arquivo contém os dados de frota para o Brasil. De novo, aqui comecamos com uma frota inicial, de Sao Paulo, para logo atualizar as frotas em base ao consumo de combustivel para cada estado.

```r
library(data.table)
library(colorout)

x <- readxl::excel_sheets("config/inventory.xlsx")

print(x)
```

De aqui vamos usar as abas fleet_age, metadata, denatran e ibge.

```r
v <- readxl::read_excel("config/inventory.xlsx", "fleet_age")
setDT(v)

v <- v[Year > 1978]

v[is.na(v)] <- 0

veh <- readxl::read_excel("config/inventory.xlsx", "metadata")$vehicles

denatran <- readxl::read_excel("config/inventory_all.xlsx", "denatran")

setDT(denatran)

```

Note aqui aqui vamostransfomrar as UF em mayuscula e logo projetamos a frota para o passado como mostrado em [Ibarra-Espinosa et al., 2026](https://pubs.acs.org/doi/full/10.1021/acs.est.5c08400).

```

denatran$UF <- toupper(iconv(denatran$UF, to = "ASCII//TRANSLIT"))

# projetando frota no passado ####
# considerar taxa crecimento ultimo ano
lapply(seq_along(veh), function(i) {
  lapply(1:40, function(j) {
    v[, eval(parse(text = veh[i]))[.N] * 0.95^j]
  }) -> dd
  unlist(dd)
}) -> df_pasada

df_pasada <- do.call("cbind", df_pasada)

df <- as.data.table(as.data.frame(df_pasada))

names(df) <- veh

df[is.na(df)] <- 0

df$Year <- 1978:(1978 - 39)

# projection ####
fd <- function(x) {
  pro <- as.numeric(vein::ef_fun(
    ef = x,
    x = 1:(length(x) + 80),
    x0 = 35,
    k = 0.15,
    L = max(x) * 1.2,
    verbose = FALSE
  ))

  dt <- data.table(x = c(x, pro))

  dt[["type"]] <- c(rep("original", length(x)), rep("projected", length(pro)))
  dt
}

rbindlist(lapply(seq_along(veh), function(i) {
  dfx <- fd(rev(v[[veh[i]]]))
  dfx$Year <- c(1979:2020, 1979:2100)
  dfx$veh <- veh[i]
  dfx
})) -> dxr

# further projection for gasoline engines
# constant, no growth

df[, type := "projected"]


melt(data = df, id.vars = c("Year", "type")) -> dff

names(dff) <- c("Year", "type", "veh", "x")


DT <- rbind(dff, dxr[, names(dff), with = F])

gveh <- grep("_G", veh, value = T)

eveh <- grep("_E", veh, value = T)

geveh <- c(gveh, eveh)

#for(i in seq_along(geveh)) {
#DT[Year > 2020 &
#   veh == geveh[i]]$x <-
#
#DT[Year == 2020 &
#   veh == geveh[i] &
#   type == "original"]$x
#
#}

dx <- rbind(
  DT[
    type == "projected" &
      !Year %in% 1979:2020
  ],
  DT[type == "original"]
)

```

Aqui vamos a plotar a frota

```
library(ggplot2)

p <- ggplot(dx, aes(x = Year, y = x, colour = type)) +
  geom_point() +
  facet_wrap(~veh, scales = "free_y")

fn <- readxl::read_excel("config/inventory_all.xlsx", "ibge")

setDT(fn)

fn$region <- toupper(iconv(fn$ESTADO, to = "ASCII//TRANSLIT"))

# dcast
dx[is.na(dx)] <- 0

dcast.data.table(data = dx, formula = Year + type ~ veh) -> dff

rbindlist(lapply(seq_along(fn$UF), function(i) {
  dff$region <- fn$UF[i]

  dff
})) -> DD

setorderv(DD, c("Year", "region"), c(-1, 1))

saveRDS(DD, "config/fleet_age_all.rds")
DD
a
       Year      type      PC_G        PC_E   PC_FG   PC_FE      LCV_G
      <int>    <char>     <num>       <num>   <num>   <num>      <num>
   1:  2100 projected 1919416.3 744263.5998 1700597 1700597 242604.678
   2:  2100 projected 1919416.3 744263.5998 1700597 1700597 242604.678
   3:  2100 projected 1919416.3 744263.5998 1700597 1700597 242604.678
   4:  2100 projected 1919416.3 744263.5998 1700597 1700597 242604.678
   5:  2100 projected 1919416.3 744263.5998 1700597 1700597 242604.678
  ---
4370:  1939 projected  106654.7    292.4937       0       0   9739.551
4371:  1939 projected  106654.7    292.4937       0       0   9739.551
4372:  1939 projected  106654.7    292.4937       0       0   9739.551
4373:  1939 projected  106654.7    292.4937       0       0   9739.551
4374:  1939 projected  106654.7    292.4937       0       0   9739.551
           LCV_E   LCV_FG   LCV_FE     LCV_D TRUCKS_SL_D TRUCKS_L_D TRUCKS_M_D
           <num>    <num>    <num>     <num>       <num>      <num>      <num>
   1: 92193.4018 211275.7 211275.7 207417.97  20549.0472  62741.299  39801.317
   2: 92193.4018 211275.7 211275.7 207417.97  20549.0472  62741.299  39801.317
   3: 92193.4018 211275.7 211275.7 207417.97  20549.0472  62741.299  39801.317
   4: 92193.4018 211275.7 211275.7 207417.97  20549.0472  62741.299  39801.317
   5: 92193.4018 211275.7 211275.7 207417.97  20549.0472  62741.299  39801.317
  ---
4370:   107.6932      0.0      0.0   5521.16    546.9853   1670.081   1059.452
4371:   107.6932      0.0      0.0   5521.16    546.9853   1670.081   1059.452
4372:   107.6932      0.0      0.0   5521.16    546.9853   1670.081   1059.452
4373:   107.6932      0.0      0.0   5521.16    546.9853   1670.081   1059.452
4374:   107.6932      0.0      0.0   5521.16    546.9853   1670.081   1059.452
      TRUCKS_SH_D TRUCKS_H_D BUS_URBAN_D BUS_MICRO_D BUS_COACH_D    MC_150_G
            <num>      <num>       <num>       <num>       <num>       <num>
   1:   57284.845  63114.153  24545.7214   5436.2110  11474.3784 1987885.970
   2:   57284.845  63114.153  24545.7214   5436.2110  11474.3784 1987885.970
   3:   57284.845  63114.153  24545.7214   5436.2110  11474.3784 1987885.970
   4:   57284.845  63114.153  24545.7214   5436.2110  11474.3784 1987885.970
   5:   57284.845  63114.153  24545.7214   5436.2110  11474.3784 1987885.970
  ---
4370:    1524.838   1680.005    876.8647    194.2017    409.9076    5600.342
4371:    1524.838   1680.005    876.8647    194.2017    409.9076    5600.342
4372:    1524.838   1680.005    876.8647    194.2017    409.9076    5600.342
4373:    1524.838   1680.005    876.8647    194.2017    409.9076    5600.342
4374:    1524.838   1680.005    876.8647    194.2017    409.9076    5600.342
      MC_150_500_G    MC_500_G MC_150_FG MC_150_500_FG MC_500_FG MC_150_FE
             <num>       <num>     <num>         <num>     <num>     <num>
   1:  242254.5707 30265.60293  491912.7      52088.61  22538.96  491912.7
   2:  242254.5707 30265.60293  491912.7      52088.61  22538.96  491912.7
   3:  242254.5707 30265.60293  491912.7      52088.61  22538.96  491912.7
   4:  242254.5707 30265.60293  491912.7      52088.61  22538.96  491912.7
   5:  242254.5707 30265.60293  491912.7      52088.61  22538.96  491912.7
  ---
4370:     543.6321    68.96361       0.0          0.00      0.00       0.0
4371:     543.6321    68.96361       0.0          0.00      0.00       0.0
4372:     543.6321    68.96361       0.0          0.00      0.00       0.0
4373:     543.6321    68.96361       0.0          0.00      0.00       0.0
4374:     543.6321    68.96361       0.0          0.00      0.00       0.0
      MC_150_500_FE MC_500_FE region
              <num>     <num> <char>
   1:      52088.61  22538.96     AC
   2:      52088.61  22538.96     AL
   3:      52088.61  22538.96     AM
   4:      52088.61  22538.96     AP
   5:      52088.61  22538.96     BA
  ---
4370:          0.00      0.00     RS
4371:          0.00      0.00     SC
4372:          0.00      0.00     SE
4373:          0.00      0.00     SP
4374:          0.00      0.00     TO
```
