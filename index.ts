//Imports
import csv from 'csv-parser';
import * as fs from 'fs';

//Variables
const covidData : any = [];
const states : any = [];
const covidResponse = { 
    covidMin: 0,
    stateMin: '',
    covidMax: 0,
    stateMax: '',
    stateAfect: '',
    afectMax: 0,
    statesPercens: [{
        name: '',
        population: 0,
        persentage: 0
    }]
}

//Obtener datos de archivo
fs.createReadStream('covid.csv').pipe(csv()).on('data', (row) => {
    covidData.push(row);
}).on('end', () => {
    getStates();
    getCovidStates();
    getCovidStatesPercen();
    getCovidStateAfect();
    console.log(`
1) El estado con el mayor acumulado de muertes hasta la fecha es ${covidResponse.stateMax}, con un total de ${covidResponse.covidMax}.

2) El estado con el menor acumulado de muertes hasta la fecha es/son ${covidResponse.stateMin}, con un total de ${covidResponse.covidMin}.

3) El estado más afectado por las muertes es ${covidResponse.stateAfect}, porque tiene el porcentaje más alto de muertes(${covidResponse.afectMax}) frente a su población.

4) Los porcentajes de muertes frente a la población de cada estado son: 

${iterStates()}
`);
});


//Obtener estados
const getStates = () => {
    let stAct = '';
    let stMax = 0;
    let stPop = 0;
    for (let i = 0; i < covidData.length; i++) {
        const e = covidData[i];
        if (stAct == e['Province_State']) {
            stAct = e['Province_State'];
            stMax += parseInt(e['4/27/21']);
            stPop += parseInt(e['Population']);
            if (i == (covidData.length - 1)) {
                states.push({
                    name: stAct,
                    count: stMax,
                    population: stPop
                });
            }
        } else {
            if (stAct != '') {
                states.push({
                    name: stAct,
                    count: stMax,
                    population: stPop
                });
            }
            stAct = e['Province_State'];
            stPop = parseInt(e['Population']);
            stMax = parseInt(e['4/27/21']);
        }
    }
}

//Obtener estadisticas
const getCovidStates = () => {
    for (let i = 0; i < states.length; i++) {
        const cD = states[i];
        if (cD.count >= covidResponse.covidMax) {
            covidResponse.covidMax = cD.count;
            covidResponse.stateMax = cD.name;
        }
        if (cD.count <= covidResponse.covidMin) {
            if (covidResponse.stateMin == '') {
                covidResponse.stateMin += cD.name;
            } else {
                covidResponse.stateMin += `, ${cD.name}`;
            }
            covidResponse.covidMin = cD.count;
        }
    }
}

//Obtener porcentajes
const getCovidStatesPercen = () => {
    for (let i = 0; i < states.length; i++) {
        const cD = states[i];
        if (cD.population == 0) {
            covidResponse.statesPercens.push({
                name: cD.name,
                persentage: cD.population,
                population: cD.population
            })            
        } else if(cD.count == 0){
            covidResponse.statesPercens.push({
                name: cD.name,
                persentage: cD.count,
                population: cD.population
            })
        } else {
            covidResponse.statesPercens.push({
                name: cD.name,
                persentage: (cD.count/cD.population)*100,
                population: cD.population
            })
        }
    }
}

//Obtener mayor afectado
const getCovidStateAfect = () => {
    for (let i = 0; i < covidResponse.statesPercens.length; i++) {
        const s = covidResponse.statesPercens[i];
        if (s.persentage > covidResponse.afectMax) {
            covidResponse.afectMax = s.persentage;
            covidResponse.stateAfect = s.name;
        }
    }
}

const iterStates = () =>{
    let states = '';
    for (let i = 0; i < covidResponse.statesPercens.length; i++) {
        const st = covidResponse.statesPercens[i];
        if (st.name != '') {
            states += `Estado: ${st.name} - Porcentaje: ${st.persentage} - Población: ${st.population}\n`;
        }
    }

    return states;
}