# db-json

Enregistre des informations dans un fichier json

## Installation

```
yarn add @fzed51/db-json
```

ou

```
npm i @fzed51/db-json
```

## Usage

```typescript
interface Data {
    id: number;
    value: string;
}

const dbJsonOption = {
  forceCreate: true,
  logFullPath: false,
}

const db = new DbJson<Data>('file.json', dbJsonOption)
(async ()=> {
    const data = await db.get() // []

    await db.set([{
        id: 1,
        value: "A"
    }])

    await db.add({
        id: 2,
        value: "B"
    })

    await db.replace({
        id: 1,
        value: "C"
    }, e => e.id === 1)

    await db.delete(e => e.id === 2)
})()
```
