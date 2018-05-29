# mycompany

## Database

#### User
> ID

> NOME

> COGNOME

> EMAIL

> PASSWORD

### Aule

#### Aula

> ID

> CAPACITA'

> NOME

> LOCAZIONE

#### Accessori aula

> ID

> NOME

#### Associazione aula/accessori

> ID AULA*

> ID ACCESSORIO*

> QUANTITA'

#### Prenotazione aula

> ID

> DATA/ORA INIZIO

> DATA/ORA FINE

> ID UTENTE*

> ID AULA*

### Sondaggi

#### Sondaggio

> ID

> ID GESTORE

> NOME

#### Domanda

> ID

> ID SONDAGGIO

> DOMANDA

> RISPOSTA

> TYPE

> STEP

> CONDIZIONI

#### Condizioni domande

> ID DOMANDA PRECENDENTE

> ID DOMANDA

> RISPOSTA

#### Risposta

> ID DOMANDA

> RISPOSTA

> ID UTENTE

### Assenze

#### 

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbMjcwNjI2NjY4LC0xMzI4NTMwMjQ3LDY3MD
E0MTk1MywtOTk1ODI4NTU3LC01ODMwNjIyMDgsLTg2NjU4NDc2
Nyw5NjIzOTE4NDMsMTM3MzI4NzcyOSwxMTM1NzA3ODI3LC0xNj
I5ODUwNTY3LDgwNjg1MzE3NF19
-->