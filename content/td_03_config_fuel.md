# Fuel

Aqui vamos rodar o main.R do projeto brazil_td. Este

Primeiro vamos ler o arquivo inventory.xlsx. Este arquivo contém os dados de frota para o Brasil. De novo, aqui comecamos com uma frota inicial, de Sao Paulo, para logo atualizar as frotas em base ao consumo de combustivel para cada estado.

```r
library(data.table)
library(ggplot2)
library(units)
x <- readxl::read_excel("config/inventory_all.xlsx",
                        "fuel_all")
setDT(x)

x$ESTADO <- toupper(iconv(x$ESTADO, to = "ASCII//TRANSLIT"))

fn <- readxl::read_excel("config/inventory_all.xlsx",
                         "ibge")
fn$ESTADO <- toupper(iconv(fn$ESTADO, to = "ASCII//TRANSLIT"))

unique(intersect(unique(x$ESTADO),
                 fn$ESTADO))
x <- merge(x,
           fn[, c("ESTADO", "UF"),
              with = F],
           all.x = TRUE)

x

x$Year <- x$ANO
x <- x[Year < 2023]
x$m <- rep(1:12, nrow(x)/12)

setorderv(x,
          cols = c("ESTADO", "Year", "m"),
          order = c(1, -1, 1))


x$m3 <- units::set_units(x$m3, m^3)

x[, d := ifelse(
  fuel == "E", 0.809,
  ifelse(
    fuel == "D", 0.84,
    0.75425))]
x$d <- units::set_units(x$d, "t/m^3")

x$consumption_t <- x$m3*x$d


x$date <- ISOdate(x$Year, x$m, 1, 0,0,0)

```

O plto a seguir mostrao os dados por mes e estado

```r
ggplot(x,
       aes(x = date,
           y = consumption_t,
           colour = fuel)) +
  geom_line() +
  facet_wrap(~UF,
             scales = "free_y")

```

![](content/figs/dado_fuel.png)

```r
setorderv(x, "date", order = -1)

names(x)[6] <- "region"


saveRDS(x, "config/fuel_month.rds")

xy <- x[, lapply(.SD, sum),
        .SDcols = c("consumption_t",
                    "m3"),
        by = .(fuel, region, Year)]

setorderv(xy, "Year", order = -1)
```

Aqui vamos a projetar os combustiveis no passado. Testamos tres tipos de projecoes. A primeira com uma razao de 0.9, a segunda com uma razao de 0.95 e a terceira com uma razao de 0.99. A razao é a taxa de decaimento da frota.

```r
# all ratios gives 0.9
fs <- c("E", "D", "G")

rbindlist(lapply(1:3,function(j){
  rbindlist(lapply(1:40,function(i){
    l <- xy[fuel == fs[j],
            consumption_t[.N]*0.9^i,
            by = region]
    l$Year <- 2000 - i
    names(l)[2] <- "consumption_t"
    l$fuel <- fs[j]
    l$type <- "data"
    l
  } ))
} )) -> fuel_past

rbindlist(lapply(1:3,function(j){
  rbindlist(lapply(1:40,function(i){
    l <- xy[fuel == fs[j],
            consumption_t[.N]*0.95^i,
            by = region]
    l$Year <- 2000 - i
    names(l)[2] <- "consumption_t"
    l$fuel <- fs[j]
    l$type <- "data"
    l
  } ))
} )) -> fuel_past095

rbindlist(lapply(1:3,function(j){
  rbindlist(lapply(1:40,function(i){
    l <- xy[fuel == fs[j],
            consumption_t[.N]*0.99^i,
            by = region]
    l$Year <- 2000 - i
    names(l)[2] <- "consumption_t"
    l$fuel <- fs[j]
    l$type <- "data"
    l
  } ))
} )) -> fuel_past099

fuel_past$consumption_t <- as.numeric(fuel_past$consumption_t)

```

Agora vamos projetar a frota para o futuro. Para isso vamos usar um ajute logistico.

```r
fd <- function(x) {
  as.numeric(
    vein::ef_fun(ef = x,
                 x = 1:(length(x) + 78),
                 x0 = 10,
                 k = 0.15,
                 L = max(x)*0.95,
                 verbose = FALSE))
}

ufs <- unique(xy$region)

rbindlist(lapply(1:3,function(j){
  rbindlist(lapply(seq_along(ufs),function(i){

    d <- as.numeric(rev(xy[fuel == fs[j] &
                             region == ufs[i]]$consumption_t))

    df1 <- data.table(
      Year = 2000:2022,
      consumption_t = d,
      region = ufs[i],
      fuel = fs[j],
      type = "data"
    )

    df2 <- data.table(
      Year = 2000:2100,
      consumption_t = fd(d),
      region = ufs[i],
      fuel = fs[j],
      type = "projection"
    )

    rbind(df1, df2)
  } ))
} )) -> fuel_future

fuel_past099$type <- "data_99"
fuel_past099$consumption_t <- as.numeric(fuel_past099$consumption_t)

fuel_past095$type <- "data_95"
fuel_past095$consumption_t <- as.numeric(fuel_past095$consumption_t)

df <- rbind(fuel_past,
            fuel_future[type == "data"],
            fuel_future[type == "projection" &
                          Year > 2022])

setorderv(df,
          c("region",
            "Year",
            "fuel"),
          order = c(1, 1, 1))

#https://dieselnet.com/standards/br/fuel.php


df[fuel == "D" &
   Year < 2001,
   sppm := ifelse(region == "SP",
		  2000,
		  3500)]
df[fuel == "D" &
   Year %in% 2001:2009,
   sppm := ifelse(region == "SP",
                  500,
                  3500)]

df[fuel == "D" &
   Year %in% 2010:2012,
   sppm := ifelse(region == "SP",
                  200,
                  1800)]

df[fuel == "D" &
   Year %in% 2013:2024,
   sppm := ifelse(region == "SP",
                  50,
                  500)]
df[fuel == "D" &
   Year > 2024,
   sppm := 50]

df[fuel == "G",
   sppm := 10]

df[fuel == "E",
   sppm := 0]

saveRDS(df, "config/fuel.rds")
```

Vamos ver este plot

```r

ggplot(df,
       aes(x = Year,
           y = consumption_t,
           colour = fuel)) +
  geom_line() +
  facet_wrap(~region,
             scales = "free_y")

```

![](content/figs/fuel_projected.png)

```r

# review 1



dt <- rbind(fuel_past,
fuel_past095,
fuel_past099,
            fuel_future)

```

Agora vamos ver mais plots. Aqui foi testado se a projecao de 0.9 e adecuada, ou 0.99 ou 0.95. Da para ver que a projecao 0.99 nao e realista e as projecoes 0.99 e 0.95 ficam muito proximas.

```r
library(mgcv)
dx <- dt[, sum(consumption_t),
          by = .(fuel, Year, type)]

ggplot() +
  geom_point(data = dx,
       aes(x = Year,
           y = V1/1000000,
           colour = fuel,
           shape = type)) +
  # Using the GAM which is more flexible and less sensitive to starting values
#  geom_smooth(data = dx[type == "data"],
#              aes(x = Year,
#                  y = V1/1000000,
 #                 fill = fuel),
  #            method = "gam", formula = y ~ s(x, bs = "tp"),
  #            se = TRUE,
  #              linetype=0) +
  facet_wrap(~fuel,
             scales = "free_y") +
               labs(y = expression(t ~ 10^6), x = NULL) +
  theme_bw(base_size = 18, base_family = "serif") +
  theme(
#    legend.position = c(0.7, 0.4),
#    legend.direction = "horizontal",
    legend.title = element_blank(),
    legend.background = element_rect(fill = 0)
  ) -> p

p
```

![](content/figs/sensitivity_past.png)

```r
dx[ type %in% c("data","projection"), .N, by = Year][N > 3, range(Year)]

dx[, .N, by = Year][N > 3, range(Year)]


dx[fuel == "D" &
    type %in% c("data","projection") &
    Year %in% 2000:2020]

dcast.data.table(dx[type %in% c("data","projection") &
    Year %in% 2000:2020],
                     fuel + Year ~ type,
                     value.var = "V1") -> dt_wide

```

Aqui testamos regressoes entre os dados projetados e os dados reais.

```r
lm(data ~ Year,
   data = dt_wide[fuel == "D"]) -> lm_d

summary(lm_d)

Call:
lm(formula = data ~ Year, data = dt_wide[fuel == "D"])

Residuals:
     Min       1Q   Median       3Q      Max
-3153954 -2046198  -665023  1065244  5677037

Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept) -2.198e+09  2.014e+08  -10.91 1.27e-09 ***
Year         1.113e+06  1.002e+05   11.11 9.38e-10 ***
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1

Residual standard error: 2781000 on 19 degrees of freedom
Multiple R-squared:  0.8666,	Adjusted R-squared:  0.8596
F-statistic: 123.5 on 1 and 19 DF,  p-value: 9.385e-10
```

```r
lm(data ~ Year,
   data = dt_wide[fuel == "G"]) -> lm_g

summary(lm_g)


lm(data ~ Year,
   data = dt_wide[fuel == "D"]) -> lm_d

summary(lm_d)


ci <- predict(lm_d,
              newdata = dt_wide[fuel == "D"],
              interval = "confidence",
              level = 0.95)

ci <- as.data.table(ci)

ggplot(ci,
       aes(x = 2000:2020,
           y = fit)) +
geom_ribbon(aes(ymin = lwr,
                    ymax = upr),
            alpha = 0.2) +
geom_line() +
geom_point(data = dt_wide[fuel == "D"],
               aes(x = Year,
                   y = data),
           colour = "red")

# G

lm(data ~ Year,
   data = dt_wide[fuel == "G"]) -> lm_g

ci <- predict(lm_g,
              newdata = dt_wide[fuel == "G"],
              interval = "confidence",
              level = 0.90)

ci <- as.data.table(ci)

ggplot(ci,
       aes(x = 2000:2020,
           y = fit)) +
geom_ribbon(aes(ymin = lwr,
                    ymax = upr),
            alpha = 0.2) +
geom_line() +
geom_point(data = dt_wide[fuel == "G"],
               aes(x = Year,
                   y = data),
           colour = "red")

# E

lm(data ~ Year,
   data = dt_wide[fuel == "E"]) -> lm_e

ci <- predict(lm_e,
              newdata = dt_wide[fuel == "E"],
              interval = "confidence",
              level = 0.95)

ci <- as.data.table(ci)

ggplot(ci,
       aes(x = 2000:2020,
           y = fit)) +
geom_ribbon(aes(ymin = lwr,
                    ymax = upr),
            alpha = 0.2) +
geom_line() +
geom_point(data = dt_wide[fuel == "E"],
               aes(x = Year,
                   y = data),
           colour = "red")

```
