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

> ID UTENTE

> DATA INIZIO

> DATA FINE

> STATO

> MOTIVAZIONE

## API
    /users



<!--stackedit_data:
eyJoaXN0b3J5IjpbLTI0MjgzNzU0NywyNzA2MjY2NjgsLTEzMj
g1MzAyNDcsNjcwMTQxOTUzLC05OTU4Mjg1NTcsLTU4MzA2MjIw
OCwtODY2NTg0NzY3LDk2MjM5MTg0MywxMzczMjg3NzI5LDExMz
U3MDc4MjcsLTE2Mjk4NTA1NjcsODA2ODUzMTc0XX0=
-->