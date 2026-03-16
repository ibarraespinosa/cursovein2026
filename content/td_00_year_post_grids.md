# post_grids

Aqui vamos a ver as emissões distribuidas na grade.

```r
#7) Post-estimation spatial ####
g <- eixport::wrf_grid("../../wrf/wrfinput_d02")
crs <- 31983
language <- "spanish" # english spanish portugues
dir.create("post/grids")
source("scripts/post_grids.R", encoding = "UTF-8", echo = F)
rm(list = ls())
gc()
```

o conteudo do script post_roads.R é o seguinte.

Aqui as emissoes so agrupadas por poluente.

```r
switch(
  language,
  "portuguese" = cat("Distribuindo os comprimentos na grade\n"),
  "english" = cat("Gridding lengths\n"),
  "spanish" = cat("Distribuyendo en la grilla\n")
)

f <- list.files(
  path = "post/streets/",
  pattern = "emis_street",
  full.names = T
)


for (j in seq_along(f)) {
  x <- readRDS(f[j])

  x <- x[, 13:ncol(x)]

  x <- st_crop(x, st_as_sfc(st_bbox(g)))

  gx <- emis_grid(spobj = x, g = g, sr = crs)

  saveRDS(gx, gsub("street", "grid", f[j]))

  rm(gx)
  gc()
}

switch(
  language,
  "portuguese" = message("\n\nArquivos em:"),
  "english" = message("\n\nFiles in:"),
  "spanish" = message("\n\nArchivos en:")
)

message("post/grid/emi_grid_XX.rds\n")

```
