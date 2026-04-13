migrate(
  (app) => {
    const usersCollectionId = app.findCollectionByNameOrId('users').id

    const collection = new Collection({
      name: 'banks',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersCollectionId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'bank_name', type: 'text', required: true, max: 100 },
        { name: 'agency', type: 'text', required: true, max: 10 },
        { name: 'account_number', type: 'text', required: true, max: 20 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_banks_user_id ON banks (user_id)',
        'CREATE INDEX idx_banks_updated ON banks (updated DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('banks')
    app.delete(collection)
  },
)
