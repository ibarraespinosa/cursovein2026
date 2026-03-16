# pre main

Nesta seção vamos copiar a pasta 2018 para os anos que queremos estimar. Em teoria podemos copiar todos so anos entre 1960 e 2100. Para este este curso vamos rodar 2018 e 2025

```r
years <- c(2018, 2025)

for (i in seq_along(years)) {
    fs::dir_copy(
        path = "config/2018",
        new_path = paste0("estimation/", years[i])
    )
}

```

Agora vamos rodar o main.R para cada ano. Primeiro entramos nas pastas dos anos, e rodamos main.R
