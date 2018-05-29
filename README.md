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
> RISPOSTA
> ID UTENTE

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEzMjg1MzAyNDcsNjcwMTQxOTUzLC05OT
U4Mjg1NTcsLTU4MzA2MjIwOCwtODY2NTg0NzY3LDk2MjM5MTg0
MywxMzczMjg3NzI5LDExMzU3MDc4MjcsLTE2Mjk4NTA1NjcsOD
A2ODUzMTc0XX0=
-->