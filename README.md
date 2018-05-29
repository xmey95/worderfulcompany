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
eyJoaXN0b3J5IjpbLTE2MjYwMTkxNzQsLTEzMjg1MzAyNDcsNj
cwMTQxOTUzLC05OTU4Mjg1NTcsLTU4MzA2MjIwOCwtODY2NTg0
NzY3LDk2MjM5MTg0MywxMzczMjg3NzI5LDExMzU3MDc4MjcsLT
E2Mjk4NTA1NjcsODA2ODUzMTc0XX0=
-->