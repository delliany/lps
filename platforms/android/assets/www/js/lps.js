var perolasFila1;
var perolasFila2;
var perolasFila3;
var fila = 0;
var qtde = 0;
var perolas = [];
var ListPerolas = [[]];
var list = 
    {
		perolas:
		[
			{
				valor:1
			}
		]
	};

function initPerolas()
{
/*    var obj = [{
        'row1' : [
			{
              'key1' : 'input1'
            
			},
			{
			  'key2' : 'inpu2'	
			}
			]
    }];
alert(obj.length);
alert(obj[0].row1[0].key1);

*/
	var linhas = document.getElementsByTagName('ul');
	var colunas;
	
	for(var aux=0; aux<linhas.length; aux++)
	{
		colunas = linhas.item(aux).getElementsByTagName('li');
		
		for(var cont=0; cont<colunas.length; cont++)
		{
			list[aux].perolas[cont].valor = 1;
		}
	}
	alert(list.length);
	for(var aux=0; aux<ListPerolas.length; aux++)
	{
		alert(ListPerolas[aux].numero.length);
		for(var cont=0; cont<ListPerolas[aux].length; cont++)
		{
			//alert(ListPerolas[aux][cont]);
		}
	}
}
/*
function jogarOponente(nivel)
{
	switch(nivel)
	{
		case 1:
			jogoFacil();
			break;
		case 2:
			jogoMedio();
			break;
		case 3:
			jogoDificil();
	}
}

function jogoFacil()
{
	var retorno;

	retorno = isExcecao();

	if(retorno == false){
		escolhaAletoria();
	}

	retiraPerola();
}

function jogoDificil()
{
	var retorno;

	retorno = isExcecao();

	if (retorno == false) {
		estrategiaJogo();
			
	}

	retiraPerola();
}

function jogoMedio()
{
	var cont = 0;
	var retorno;

	retorno = isExcecao();

	if (retorno == false) {
		cont = Math.floor(Math.random() * 2);
		if (cont == 0) {
			estrategiaJogo();
		}else{
			escolhaAletoria();
		}
	}	

	retiraPerola();
}

function retiraPerola()
{
	for(var aux = 0; aux < 5; aux++)
	{
		if(((controller.buscarValorPerola(fila, aux)) == 0)&&(qtde > 0)){
			controller.retirarPerola(fila, aux);
			qtde--;
		}
		if(qtde < 1){
			return;
		}
	}
}

function estrategiaJogo()
{
	var binN1,binN2,binN3,somaS;
	var valor1,valor2,valor3,aux = 0,aux2 = 0,somaI;

	binN1 = Integer.toBinaryString(perolasFila1);
	binN2 = Integer.toBinaryString(perolasFila2);
	binN3 = Integer.toBinaryString(perolasFila3);

	valor1 = Integer.parseInt(binN1);
	valor2 = Integer.parseInt(binN2);
	valor3 = Integer.parseInt(binN3);

	somaI = valor1+valor2+valor3;
	somaS = Integer.toString(somaI);

	for(int cont = 0; cont < somaS.length(); cont++)
	{
		if((somaS.charAt(cont)== '1')||(somaS.charAt(cont)== '3')){
			aux++;
		}
	}

	switch(aux)
	{
		case 0:
			qtde = 1;
			while(aux2 == 0)
			{
				fila = Math.floor(Math.random() * 3);
				
				switch(fila)
				{
					case 0:
						if((perolasFila1 == 0)||(perolasFila1 == 1)){
							aux2 = 0;
						}else{
							aux2 = 1;
						}
						break;
						
					case 1:
						if((perolasFila2 == 0)||(perolasFila2 == 1)){
							aux2 = 0;
						}else{
							aux2 = 1;
						}
						break;
						
					case 2:
						if((perolasFila3 == 0)||(perolasFila3 == 1)){
							aux2 = 0;
						}else{
							aux2 = 1;
						}
				}
			}	
			break;
		default:
			qtde = combinarValores(valor1,valor2,binN3);
			fila = 2;
			if(qtde == -1){
				qtde = combinarValores(valor1,valor3,binN2);
				fila = 1;
				if(qtde == -1){
					qtde = combinarValores(valor2,valor3,binN1);	
					fila = 0;
				}
			}
	}
}

function combinarValores(int fila1, int fila2, String fila3)
{
	var filaAux, somaS;
	var somaI, valor1, valor2;

	somaI = fila1+fila2;

	somaS = somaI.toString();
	
	for(int cont = 0; cont < somaS.length(); cont++)
	{
		if(somaS.charAt(cont)== '1'){
			filaAux = filaAux+'1';
		}else if((somaS.charAt(cont)== '0')||
				(somaS.charAt(cont)== '2')){
			filaAux = filaAux+'0';
		}
	}

	valor1 = Integer.parseInt(filaAux, 2);
	valor2 = Integer.parseInt(fila3, 2);

	if(valor1 > valor2){
	   return -1;
	}
	
	return (valor2-valor1);
}

function isExcecao()
{
	var retorno;
	
	retorno = jogadaExcecao();
	
	switch(retorno)
	{
		case 0:
			if(perolasFila1 == 1){
				qtde = perolasFila1;
			}else{
				qtde = perolasFila1 - 1;
			}
			fila = 0;
			break;
			
		case 1:
			if(perolasFila2 == 1){
				qtde = perolasFila2;
			}else{
				qtde = perolasFila2 - 1;
			}
			fila = 1;
			break;
			
		case 2:
			if(perolasFila3 == 1){
				qtde = perolasFila3;
			}else{
				qtde = perolasFila3 - 1;
			}
			fila = 2;
			break;
			
		case 3:
			fila = 0;
			qtde = perolasFila1;
			break;
			
		case 4:
			fila = 1;
			qtde = perolasFila2;
			break;
			
		case 5:
			fila = 2;
			qtde = perolasFila3;
			break;
		case 6:		
			return false;
	}
	return true;
}

function escolhaAletoria()
{
	Random rnd = new Random();
	int cont = 0, aux = 0, perolas = 0;
	
	while(aux == 0)
	{
		fila = rnd.nextInt(3);
		switch(fila)
		{
			case 0:
				cont = 3;
				perolas = perolasFila1;
				break;
			case 1:
				cont = 4;
				perolas = perolasFila2;
				break;
			case 2:
				cont = 5;
				perolas = perolasFila3;
		}
		aux = retornarPerolasFila(fila,cont);
	}
	while(qtde == 0)
	{
		if(perolas == 1){
			qtde = 1;
		}else{
			qtde = rnd.nextInt(perolas);
		}
	}
}

function retornarPerolasFila(int fileira, int qtde)
{
	var cont = 0;
	
	for(int aux = 0; aux < qtde; aux++)
	{
		if(controller.buscarValorPerola(fileira, aux) == 0){
			cont++;
		}
	}
	
	if(cont > 0){
		return cont;
	}
	return 0;
}

function jogadaExcecao()
{		 
	perolasFila1 = retornarPerolasFila(0,3);
	perolasFila2 = retornarPerolasFila(1,4);
	perolasFila3 = retornarPerolasFila(2,5);
	
	if(((perolasFila1 != 0)&&(perolasFila2 == 0)&&(perolasFila3 == 0))
			||((perolasFila1 > 0)&&(perolasFila2 == 1)&&(perolasFila3 == 1))
			||((perolasFila1 == 1)&&(perolasFila2 == 1)&&(perolasFila3 == 0))){
		return 0 ;
	}else if(((perolasFila1 == 0)&&(perolasFila2 != 0)&&(perolasFila3 == 0))
			||((perolasFila1 == 1)&&(perolasFila2 > 0)&&(perolasFila3 == 1))
			||((perolasFila1 == 0)&&(perolasFila2 == 1)&&(perolasFila3 == 1))){
		return 1;
	}else if(((perolasFila1 == 0)&&(perolasFila2 == 0)&&(perolasFila3 != 0))
			||((perolasFila1 == 1)&&(perolasFila2 == 1)&&(perolasFila3 > 0))
			||((perolasFila1 == 1)&&(perolasFila2 == 0)&&(perolasFila3 == 1))){
		return 2;
	}
	
	if(((perolasFila1 > 1)&&(perolasFila2 == 1)&&(perolasFila3 == 0))||
	   ((perolasFila1 > 1)&&(perolasFila2 == 0)&&(perolasFila3 == 1))){
		return 3;
	}else if(((perolasFila1 == 0)&&(perolasFila2 > 1)&&(perolasFila3 == 1))||
	   ((perolasFila1 == 1)&&(perolasFila2 > 1)&&(perolasFila3 == 0))){
		return 4;
	}else if(((perolasFila1 == 0)&&(perolasFila2 == 1)&&(perolasFila3 > 1))||
	   ((perolasFila1 == 1)&&(perolasFila2 == 0)&&(perolasFila3 > 1))){
		return 5;
	}
	
	return 6;
}*/