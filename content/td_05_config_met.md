# Temperature

Nesta seção vamos ler os dados de temperatura para o Brasil. Os dados estão no arquivo inventory_all.xlsx na aba met.

```r


library(data.table)
x <- readxl::read_excel("config/inventory_all.xlsx",
                        "met")
setDT(x)

x$date <- ISOdate(x$Year, x$Month, 1, 0,0,0)
x[,
  mean(Temperature),
  by = .(region, capitals, date, scenario, Year, Month)] -> mett

names(mett)[ncol(mett)] <- "Temperature"
unique(mett$scenario)
mett[Year %in% 2020:2022 &
       scenario == "historic"]$scenario <- "SSP 1.9"

mett[Year %in% 2020:2022, unique(scenario)]


mett[is.na(Temperature), unique(Year)]

met1 <- mett[Year %in% 1960:2020]
met2 <- mett[Year == 2022]

met2$Year <- 2021
met3 <- mett[Year %in% 2022:2100]
met <- rbind(met1, met2, met3)

met[is.na(Temperature), unique(Year)]


saveRDS(met, "config/met.rds")



```

Vamos a ver un plot

```r
ggplot(met, aes(x = date, y = Temperature, colour = scenario)) +
  geom_point(alpha = 0.5) +
  facet_wrap(~region)
```

![](content/figs/temp.png)
