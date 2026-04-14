migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('transactions')
    const banksCol = app.findCollectionByNameOrId('banks')

    if (!col.fields.getByName('bankId')) {
      col.fields.add(
        new RelationField({
          name: 'bankId',
          collectionId: banksCol.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('transactions')
    if (col.fields.getByName('bankId')) {
      col.fields.removeByName('bankId')
      app.save(col)
    }
  },
)
