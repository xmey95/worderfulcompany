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
> CONDIZIONI DOMANDE

#### Percorsi alternativi

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
eyJoaXN0b3J5IjpbMjAyNDk2MDQsNjcwMTQxOTUzLC05OTU4Mj
g1NTcsLTU4MzA2MjIwOCwtODY2NTg0NzY3LDk2MjM5MTg0Mywx
MzczMjg3NzI5LDExMzU3MDc4MjcsLTE2Mjk4NTA1NjcsODA2OD
UzMTc0XX0=
-->