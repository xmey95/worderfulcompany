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

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbMTE3NzgyNTQwLC01ODMwNjIyMDgsLTg2Nj
U4NDc2Nyw5NjIzOTE4NDMsMTM3MzI4NzcyOSwxMTM1NzA3ODI3
LC0xNjI5ODUwNTY3LDgwNjg1MzE3NF19
-->