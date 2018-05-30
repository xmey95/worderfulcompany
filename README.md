# WonderfulCompany

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

> IDhttps://stackedit.io/app#

> ID UTENTE*

> DATA INIZIO

> DATA FINE

> STATO

> MOTIVAZIONE

> GIUSTIFICATIVO

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbMTI4NDcyNjY0MiwxNjI1OTEzODc0LDEwOT
E3MTQ4NDQsMTE1MTkxMDA0NSwtMjQ4NDY4MjEzLDI3MDYyNjY2
OCwtMTMyODUzMDI0Nyw2NzAxNDE5NTMsLTk5NTgyODU1NywtNT
gzMDYyMjA4LC04NjY1ODQ3NjcsOTYyMzkxODQzLDEzNzMyODc3
MjksMTEzNTcwNzgyNywtMTYyOTg1MDU2Nyw4MDY4NTMxNzRdfQ
==
-->