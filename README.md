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
eyJoaXN0b3J5IjpbMTE1MTkxMDA0NSwtMjQ4NDY4MjEzLDI3MD
YyNjY2OCwtMTMyODUzMDI0Nyw2NzAxNDE5NTMsLTk5NTgyODU1
NywtNTgzMDYyMjA4LC04NjY1ODQ3NjcsOTYyMzkxODQzLDEzNz
MyODc3MjksMTEzNTcwNzgyNywtMTYyOTg1MDU2Nyw4MDY4NTMx
NzRdfQ==
-->