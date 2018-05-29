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

> ID GESTORE*

> NOME

#### Domanda

> ID

> ID SONDAGGIO*

> DOMANDA

> RISPOSTA

> TYPE

> STEP

> CONDIZIONI

#### Condizioni domande

> ID

> ID DOMANDA PRECENDENTE*

> ID DOMANDA*

> RISPOSTA

#### Risposta

> ID DOMANDA*

> RISPOSTA

> ID UTENTE*

### Assenze

#### Supervisione

> ID DIPENDENTE*

> ID CAPO*

#### Assenza

> ID

> ID UTENTE*

> DATA INIZIO

> DATA FINE

> STATO

> MOTIVAZIONE

> GIUSTIFICATIVO

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbMTA5MTcxNDg0NCwxMTUxOTEwMDQ1LC0yND
g0NjgyMTMsMjcwNjI2NjY4LC0xMzI4NTMwMjQ3LDY3MDE0MTk1
MywtOTk1ODI4NTU3LC01ODMwNjIyMDgsLTg2NjU4NDc2Nyw5Nj
IzOTE4NDMsMTM3MzI4NzcyOSwxMTM1NzA3ODI3LC0xNjI5ODUw
NTY3LDgwNjg1MzE3NF19
-->