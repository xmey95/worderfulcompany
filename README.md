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
> CONDIZIONI

#### CO

> ID DOMANDA PRECENDENTE
> ID DOMANDA SUCESSIVA
> RISPOSTA

#### Risposta

> ID DOMANDA
> ID RISPOSTA
> ID UTENTE

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbMTI5ODA4NjU0NCw2NzAxNDE5NTMsLTk5NT
gyODU1NywtNTgzMDYyMjA4LC04NjY1ODQ3NjcsOTYyMzkxODQz
LDEzNzMyODc3MjksMTEzNTcwNzgyNywtMTYyOTg1MDU2Nyw4MD
Y4NTMxNzRdfQ==
-->