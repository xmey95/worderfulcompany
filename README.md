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

#### Condizioni domande

> ID DOMANDA PRECENDENTE
> ID DOMANDA
> RISPOSTA

#### Risposta

> ID DOMANDA
> ID RISPOSTA
> ID UTENTE

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbODQ1MzYxMzA0LDY3MDE0MTk1MywtOTk1OD
I4NTU3LC01ODMwNjIyMDgsLTg2NjU4NDc2Nyw5NjIzOTE4NDMs
MTM3MzI4NzcyOSwxMTM1NzA3ODI3LC0xNjI5ODUwNTY3LDgwNj
g1MzE3NF19
-->