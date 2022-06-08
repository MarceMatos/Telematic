
const socket = io()
IDProgram = [];
Victorias = [];

FechaH = new Date().toISOString().split('T')[0];
socket.emit('Client: RequestProgramation',FechaH)
socket.emit('Client: TablePositionRequest')

socket.on('Server: Victorias',(data)=>{
    Victorias = [];
    data.forEach(data=>{
        if(data.Victoria=='A'){
            Victorias.push(data["Equipo A"])
        }else{
            Victorias.push(data["Equipo B"])
        }
    })
})


socket.on('Server: TablePositionReply',(data)=>{
    TablaRepeticiones = [];
    Positiones = "";
    data.forEach(data=>{
        Repeticiones = 0;
        Victorias.forEach(Victorias=>{
            if(Victorias == data.nombreequipo){
                Repeticiones++;
            }
        })
        TablaRepeticiones.push([data.nombreequipo,Repeticiones])
        console.log(TablaRepeticiones)
    })
    

    for(let i = 0; i < TablaRepeticiones.length; i++){
        for(let j=0; j < TablaRepeticiones.length - i -1; j++){
            if(TablaRepeticiones[j][1]<TablaRepeticiones[j+1][1]){
                guardar = TablaRepeticiones[j][1];
                TablaRepeticiones[j][1] = TablaRepeticiones[j+1][1];
                TablaRepeticiones[j+1][1] = guardar;    
                [TablaRepeticiones[j][0],TablaRepeticiones[j+1][0]] = [TablaRepeticiones[j+1][0],TablaRepeticiones[j][0]]
            }
        }
    }
    
    i = 0;
    TablaRepeticiones.forEach((TablaRepeticiones,idx)=>{
        i++;
        Positiones = Positiones + `<tr class = 'table-primary' ><td>`+ i + `</td>
                            <td> ` + TablaRepeticiones[0] + `</td> 
                            <td> ` + TablaRepeticiones[1] + `</td></tr>`
    })
    document.getElementById('Posiciones').innerHTML = Positiones;
})

socket.on('Server: ProgramationReply',(data)=>{
    Patidos = ''
    IDProgram = [];
    Victorias = [];
    data.forEach(data => {
        Estado = ''
        Accion = ``
        if(data.FechaFinal != null){
            if(new Date(data.Fecha) < new Date() && new Date() < new Date(data.FechaFinal)){
                Estado = 'En curso'
                Accion =    `<a href='/Progreso/`+ data.IDProgramacion +`' class='btn btn-primary'>Estado Online</a>
                            <a href='/Narrar/`+ data.IDProgramacion +`' class='btn btn-primary'>Narrar</a>`
                Resultado = ``
            }else if(new Date() > new Date(data.FechaFinal)){
    
                Estado = 'Finalizado'
                Accion = `<a href='/Resultado/`+ data.IDProgramacion +`' class='btn btn-primary'>Ver resultado</a>`
            }else{
                Estado = 'Proximamente'
                Accion = ``
                Resultado = ``
            }
        }else{
            Estado = 'Proximamente'
        }
        

        Patidos = Patidos + `<tr class = 'table-primary' ><td>`+ data["Equipo A"] + " <b>vs</b> " + data["Equipo B"] + `</td>
                            <td id=Result-` + data.IDProgramacion + `></td> 
                            <td> ` + data.Fecha.split('T')[1].replace('Z',"") + `</td> 
                            <td> ` + Estado + `</td><td>` + Accion + `</td></tr>`
        IDProgram.push(data.IDProgramacion);
    });
    document.getElementById('Partidos').innerHTML = Patidos
    socket.emit('Client: RequesResult',IDProgram)
})


socket.on('Server: ReplyResult', (data)=>{
    data.forEach(data=>{
        document.getElementById('Result-' + data.IDGame).innerHTML = data.GolesEquipoA + ' - ' + data.GolesEquipoB
    })
})