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
eyJoaXN0b3J5IjpbMTYyNTkxMzg3NCwxMDkxNzE0ODQ0LDExNT
E5MTAwNDUsLTI0ODQ2ODIxMywyNzA2MjY2NjgsLTEzMjg1MzAy
NDcsNjcwMTQxOTUzLC05OTU4Mjg1NTcsLTU4MzA2MjIwOCwtOD
Y2NTg0NzY3LDk2MjM5MTg0MywxMzczMjg3NzI5LDExMzU3MDc4
MjcsLTE2Mjk4NTA1NjcsODA2ODUzMTc0XX0=
-->