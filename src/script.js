/*
  --------------------------------------------------------------------------------------
  MAPA
  --------------------------------------------------------------------------------------
*/
const map = L.map('map').setView([-3.117034, -60.025780], 4)

const layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

layer.addTo(map)

// Camada de pipelines
const pipelinesLayer = L.layerGroup().addTo(map);

// Camada de terremotos
const terremotosLayer = L.layerGroup().addTo(map);


/*
  --------------------------------------------------------------------------------------
    PIPELINES: Buscar todos os pipelines da base ao iniciar o dashboard via requisição GET
  --------------------------------------------------------------------------------------
*/

const getPipelines = async () => {
    let url = 'http://127.0.0.1:5000/pipelines';
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            data.pipelines.forEach(item => insertListPipelines(item.id, item.pais, item.operadora, item.nome_duto, item.produto, item.latitude_inicio, item.longitude_inicio, item.latitude_fim, item.longitude_fim))
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

getPipelines();

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo Pipeline na base de dados via requisição POST
  --------------------------------------------------------------------------------------
*/

const postPipeline = async (inputPais, inputOperadora, inputNomeDuto, inputProduto, inputLatitudeInicio, inputLongitudeInicio, inputLatitudeFim, inputLongitudeFim) => {
    const formData = new FormData();
    formData.append('pais', inputPais);
    formData.append('operadora', inputOperadora);
    formData.append('nome_duto', inputNomeDuto);
    formData.append('produto', inputProduto);
    formData.append('latitude_inicio', inputLatitudeInicio);
    formData.append('longitude_inicio', inputLongitudeInicio);
    formData.append('latitude_fim', inputLatitudeFim);
    formData.append('longitude_fim', inputLongitudeFim);

    let url = 'http://127.0.0.1:5000/pipeline';
    return await fetch(url, {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
};

/*
  --------------------------------------------------------------------------------------
  Função para buscar terremotos na minha API que conecta com a API da USGS usando como input as coordenadas do início
  do duto e um raio de 1000km via requisição GET.
  --------------------------------------------------------------------------------------
*/

function getTerremotos(lat_duto, lon_duto) {
    let url = `http://localhost:5000/earthquake/usgs?latitude=${lat_duto}&longitude=${lon_duto}`;

    fetch(url, {
        method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Deletamos os terremotos da pesquisa anterior
            terremotosLayer.clearLayers();

            const terremotos = data.earthquakes;

            if (!terremotos || terremotos.length === 0) {
                console.warn('Nenhum terremoto encontrado perto deste duto.');
                return;
            }

            const bounds = [];

            // Itera sobre os terremotos encontrados
            terremotos.forEach(item => {
                let lat, lon;

                // Extrai as coordenadas
                if (item.geom) {
                    // Substituimos as o ponto pela vírgula para separar a latitude e a longitude
                    const coords = item.geom.replace('POINT(', '').replace(')', '').split(' ');
                    lon = parseFloat(coords[0]);
                    lat = parseFloat(coords[1]);
                } else {
                    // Fallback de segurança por si envías lat/lon directamente desde python
                    lat = parseFloat(item.latitude);
                    lon = parseFloat(item.longitude);
                }

                const magnitude = parseFloat(item.magnitude);

                // Validamos que as coordenadas sejam números válidos
                if (!isNaN(lat) && !isNaN(lon)) {
                    const marker = L.circleMarker([lat, lon], {
                        radius: magnitude ? magnitude * 2 : 5,
                        color: '#d32f2f',
                        fillColor: '#f44336',
                        fillOpacity: 0.6,
                        weight: 1
                    });

                    terremotosLayer.addLayer(marker);
                    bounds.push([lat, lon]);
                }
            });

            if (bounds.length > 0) {
                bounds.push([lat_duto, lon_duto]);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        })
        .catch(error => console.error('Error ao buscar terremotos:', error));
}

/*
  --------------------------------------------------------------------------------------
  Adicionar as pipelines no mapa
  --------------------------------------------------------------------------------------
*/
const renderizarPipelinesNoMapa = (pipelines) => {
    pipelinesLayer.clearLayers();

    if (!pipelines || pipelines.length === 0) return;

    const bounds = [];

    pipelines.forEach(duto => {
        const latIni = parseFloat(duto.latitude_inicio);
        const lonIni = parseFloat(duto.longitude_inicio);
        const latFim = parseFloat(duto.latitude_fim);
        const lonFim = parseFloat(duto.longitude_fim);


        if (!isNaN(latIni) && !isNaN(lonIni) && !isNaN(latFim) && !isNaN(lonFim)) {

            const trayectoria = [
                [latIni, lonIni],
                [latFim, lonFim]
            ];

            const polyline = L.polyline(trayectoria, {
                color: '#0d6efd',
                weight: 5,
                opacity: 0.85,
                smoothFactor: 1
            });

            pipelinesLayer.addLayer(polyline);

            bounds.push([latIni, lonIni], [latFim, lonFim]);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
};


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
    let span = document.createElement("span");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista apresentada clickando no botão close
  --------------------------------------------------------------------------------------
*/
const removePipeline = () => {
    let close = document.getElementsByClassName("close");
    let table = document.getElementById('lista-pipelines');
    let i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let div = this.parentElement.parentElement;
            const nomeItem = div.getElementsByTagName('td')[0].innerHTML
            if (confirm("Você tem certeza?")) {
                div.remove()
                deletePipeline(nomeItem)
            }
        }
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar uma Pipeline da base de dados via requisição DELETE
  --------------------------------------------------------------------------------------
*/

const deletePipeline = async (id) => {
    try {
        const url = `http://127.0.0.1:5000/pipeline?id=${id}`;
        const response = await
            fetch(url, {
                method: 'DELETE'
            });

        if (response.ok) {
            alert("Duto excluído com sucesso!");

        } else {
            alert("Erro ao excluir o duto.");
        }
    } catch (error) {
        console.error("Erro na requisição de exclusão:", error);
    }
};


/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo Pipeline na lista apresentada e no mapa
  --------------------------------------------------------------------------------------
*/

const novoPipeline = async () => {
    let inputPais = document.getElementById("pais-pipeline").value;
    let inputOperadora = document.getElementById("operadora").value;
    let inputNomeDuto = document.getElementById("nome_duto").value;
    let inputProduto = document.getElementById("produto").value;
    let inputLatitudeInicio = document.getElementById("lat_inicio").value;
    let inputLongitudeInicio = document.getElementById("lon_inicio").value;
    let inputLatitudeFim = document.getElementById("lat_fim").value;
    let inputLongitudeFim = document.getElementById("lon_fim").value;

    if (inputPais === '' || inputOperadora === '' || inputNomeDuto === '' || inputProduto === '' || inputLatitudeInicio === '' || inputLongitudeInicio === '' || inputLatitudeFim === '' || inputLongitudeFim === '') {
        alert("Todos os campos precisam ser preenchidos!");

    } else if (isNaN(inputLatitudeInicio) || isNaN(inputLongitudeInicio) || isNaN(inputLatitudeFim) || isNaN(inputLongitudeFim)) {
        alert("As coordenadas precisam ser números!");
    } else {
        var postpipe = await postPipeline(inputPais, inputOperadora, inputNomeDuto, inputProduto, inputLatitudeInicio, inputLongitudeInicio, inputLatitudeFim, inputLongitudeFim)
        insertListPipelines(postpipe.id, postpipe.pais, postpipe.operadora, postpipe.nome_duto, postpipe.produto, postpipe.latitude_inicio, postpipe.longitude_inicio, postpipe.latitude_fim, postpipe.longitude_fim)
        alert("Pipeline adicionado!")

        const novaPipeline = {
            pais: inputPais,
            operadora: inputOperadora,
            nome_duto: inputNomeDuto,
            produto: inputProduto,
            latitude_inicio: inputLatitudeInicio,
            longitude_inicio: inputLongitudeInicio,
            latitude_fim: inputLatitudeFim,
            longitude_fim: inputLongitudeFim
        };

        renderizarPipelinesNoMapa([novaPipeline]);
        console.log('Chamou a função de renderização')
        let lat = parseFloat(inputLatitudeInicio);
        let lon = parseFloat(inputLongitudeInicio);
        if (!isNaN(lat) && !isNaN(lon)) {
            console.log('Entrou no if getterremotos')
            getTerremotos(lat, lon);
        };

        // Limpar os campos corretamente chamando o getElementById
        document.getElementById("pais-pipeline").value = '';
        document.getElementById("operadora").value = '';
        document.getElementById("nome_duto").value = '';
        document.getElementById("produto").value = '';
        document.getElementById("lat_inicio").value = '';
        document.getElementById("lon_inicio").value = '';
        document.getElementById("lat_fim").value = '';
        document.getElementById("lon_fim").value = '';
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertListPipelines = (id, pais, operadora, nome_duto, produto, latitude_inicio, longitude_inicio, latitude_fim, longitude_fim) => {
    var item = [id, pais, operadora, nome_duto, produto, latitude_inicio, longitude_inicio, latitude_fim, longitude_fim]
    var table = document.getElementById('lista-pipelines');
    var row = table.insertRow();

    for (var i = 0; i < item.length; i++) {
        var cel = row.insertCell(i);
        cel.textContent = item[i];
    }

    insertButton(row.insertCell(-1))

    removePipeline()
}

/*
  --------------------------------------------------------------------------------------
  Função para atualizar uma Pipeline da lista do servidor via requisição PUT
  --------------------------------------------------------------------------------------
*/

const updatePipeline = async (inputId, inputPais, inputOperadora, inputNomeDuto, inputProduto, inputLatitudeInicio, inputLongitudeInicio, inputLatitudeFim, inputLongitudeFim) => {
    const formData = new FormData();
    formData.append('id', inputId);
    formData.append('pais', inputPais);
    formData.append('operadora', inputOperadora);
    formData.append('nome_duto', inputNomeDuto);
    formData.append('produto', inputProduto);
    formData.append('latitude_inicio', inputLatitudeInicio);
    formData.append('longitude_inicio', inputLongitudeInicio);
    formData.append('latitude_fim', inputLatitudeFim);
    formData.append('longitude_fim', inputLongitudeFim);

    let url = 'http://127.0.0.1:5000/pipeline?id=${id}';
    return await fetch(url, {
        method: 'PUT',
        body: formData
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
};

/*
  --------------------------------------------------------------------------------------
  Função para atualizar uma linha na tabela lista-pipelines com base no ID
  --------------------------------------------------------------------------------------
*/
const updateListPipelines = (id, pais, operadora, nome_duto, produto, latitude_inicio, longitude_inicio, latitude_fim, longitude_fim) => {
    let table = document.getElementById('lista-pipelines');
    let rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let celulas = rows[i].getElementsByTagName('td');
        // A primeira coluna (índice 0) contém o ID do duto
        if (celulas.length > 0 && celulas[0].textContent.trim() == id.toString().trim()) {
            celulas[1].textContent = pais;
            celulas[2].textContent = operadora;
            celulas[3].textContent = nome_duto;
            celulas[4].textContent = produto;
            celulas[5].textContent = latitude_inicio;
            celulas[6].textContent = longitude_inicio;
            celulas[7].textContent = latitude_fim;
            celulas[8].textContent = longitude_fim;
            return true;
        }
    }
    return false;
};

/*
  --------------------------------------------------------------------------------------
  Função para editar um Pipeline na base de dados
  --------------------------------------------------------------------------------------
*/

const editarPipeline = async () => {
    let inputId = parseInt(document.getElementById("edit-id").value);
    let inputPais = document.getElementById("pais-edit").value;
    let inputOperadora = document.getElementById("operadora-edit").value;
    let inputNomeDuto = document.getElementById("nome_duto-edit").value;
    let inputProduto = document.getElementById("produto-edit").value;
    let inputLatitudeInicio = parseFloat(document.getElementById("lat_inicio-edit").value);
    let inputLongitudeInicio = parseFloat(document.getElementById("lon_inicio-edit").value);
    let inputLatitudeFim = parseFloat(document.getElementById("lat_fim-edit").value);
    let inputLongitudeFim = parseFloat(document.getElementById("lon_fim-edit").value);

    if (inputId === '' || inputPais === '' || inputOperadora === '' || inputNomeDuto === '' || inputProduto === '' || inputLatitudeInicio === '' || inputLongitudeInicio === '' || inputLatitudeFim === '' || inputLongitudeFim === '') {
        alert("Todos os campos precisam ser preenchidos!");

    } else if (isNaN(inputId) || isNaN(inputLatitudeInicio) || isNaN(inputLongitudeInicio) || isNaN(inputLatitudeFim) || isNaN(inputLongitudeFim)) {
        alert("O ID e as coordenadas precisam ser números!");
    } else {
        await updatePipeline(inputId, inputPais, inputOperadora, inputNomeDuto, inputProduto, inputLatitudeInicio, inputLongitudeInicio, inputLatitudeFim, inputLongitudeFim);

        // Busca a linha na tabela pelo ID e atualiza os valores
        let atualizado = updateListPipelines(inputId, inputPais, inputOperadora, inputNomeDuto, inputProduto, inputLatitudeInicio, inputLongitudeInicio, inputLatitudeFim, inputLongitudeFim);

        if (atualizado) {
            alert("Pipeline atualizado com sucesso!");
        } else {
            alert("Pipeline atualizado no servidor, mas ID não foi encontrado na tabela!");
        }

        document.getElementById("edit-id").value = '';
        document.getElementById("pais-edit").value = '';
        document.getElementById("operadora-edit").value = '';
        document.getElementById("nome_duto-edit").value = '';
        document.getElementById("produto-edit").value = '';
        document.getElementById("lat_inicio-edit").value = '';
        document.getElementById("lon_inicio-edit").value = '';
        document.getElementById("lat_fim-edit").value = '';
        document.getElementById("lon_fim-edit").value = '';

        // Fecha o modal no Bootstrap caso esteja aberto
        let modalEl = document.getElementById('exampleModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    }
}



