migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('transactions')

    if (!col.fields.getByName('fitId')) {
      col.fields.add(new TextField({ name: 'fitId' }))
    }
    if (!col.fields.getByName('refNum')) {
      col.fields.add(new TextField({ name: 'refNum' }))
    }

    col.addIndex('idx_transactions_fitId', false, 'fitId', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('transactions')
    col.removeField('fitId')
    col.removeField('refNum')
    col.removeIndex('idx_transactions_fitId')
    app.save(col)
  },
)
