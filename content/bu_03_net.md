# net.R

Aqui vamos a ler os arquivos de fluxio veicular e criar a rede. A geracao do fluxo depende dos dados de entrada. na modelacao de trafego macroscopica de 4 etapas no geral e modelado o fluxo de maximo carregamento da rede no horario pico de manha. O volume e modelado no geral como veiculos leves e veiculos pesados. Em algums casos tambem tem modelacao de onibus, que pode ser tambme obtido com [GTFS](https://github.com/ipeaGIT/gtfs2gps), e inclusive calcular as [emissoes](https://github.com/ipeaGIT/gtfs2emis). Neste caso temos fluxo de:

- pc: veiculos de pasageiros
- lcv: veiculos leves de carga
- trucks: veiculos pesados de carga
- bus: onibus
- mc: motocicletas

A divisao de pc, lcv e m,c foi obtida aplicado uma particao no fluxo de leves, caminhoes e onibus foi obtida de forma separada. O resultado do script vai ser simplesmente net.rds e plotar os fluxos.

```
# 1) Network ####
language <- "portuguese" # english spanish
net <- sf::st_read("network/net.gpkg")
crs <- 31983
tit <- "Fluxo veicular [veh/h] em São Paulo"
categories <- c("pc", "lcv", "trucks", "bus", "mc") # in network/net.gpkg
source("scripts/net.R", encoding = "UTF-8")
rm(list = ls())
gc()

```

![](content/figs/NET_pc.png)

![](content/figs/NET_lcv.png)

![](content/figs/NET_trucks.png)

![](content/figs/NET_bus.png)

![](content/figs/NET_mc.png)
