migrate(
  (app) => {
    const cardsCollection = app.findCollectionByNameOrId('cards')
    cardsCollection.fields.add(new NumberField({ name: 'availableLimit' }))
    cardsCollection.fields.add(new NumberField({ name: 'usedLimit' }))
    cardsCollection.fields.add(new DateField({ name: 'nextClosingDate' }))
    cardsCollection.fields.add(new TextField({ name: 'bankName' }))
    cardsCollection.fields.add(new TextField({ name: 'flag' }))
    app.save(cardsCollection)

    const txCollection = app.findCollectionByNameOrId('transactions')
    txCollection.fields.add(
      new RelationField({
        name: 'cardId',
        collectionId: cardsCollection.id,
        maxSelect: 1,
      }),
    )
    app.save(txCollection)
  },
  (app) => {
    const cardsCollection = app.findCollectionByNameOrId('cards')
    cardsCollection.fields.removeByName('availableLimit')
    cardsCollection.fields.removeByName('usedLimit')
    cardsCollection.fields.removeByName('nextClosingDate')
    cardsCollection.fields.removeByName('bankName')
    cardsCollection.fields.removeByName('flag')
    app.save(cardsCollection)

    const txCollection = app.findCollectionByNameOrId('transactions')
    txCollection.fields.removeByName('cardId')
    app.save(txCollection)
  },
)
