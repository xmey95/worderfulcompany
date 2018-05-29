# mycompany

## Database

#### User
> ID
> NOME
> COGNOME
> EMAIL
> PASSWORD

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
> ALte

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbLTk4OTYzMzQxMiwtNTgzMDYyMjA4LC04Nj
Y1ODQ3NjcsOTYyMzkxODQzLDEzNzMyODc3MjksMTEzNTcwNzgy
NywtMTYyOTg1MDU2Nyw4MDY4NTMxNzRdfQ==
-->