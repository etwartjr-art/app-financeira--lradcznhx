migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new SelectField({ name: 'role', values: ['Admin', 'User'], maxSelect: 1 }))
    users.fields.add(
      new SelectField({ name: 'situation', values: ['Ativo', 'Devedor'], maxSelect: 1 }),
    )
    users.listRule = "@request.auth.id != '' && (role = 'Admin' || id = @request.auth.id)"
    users.viewRule = "@request.auth.id != '' && (role = 'Admin' || id = @request.auth.id)"
    users.updateRule = "@request.auth.id != '' && (role = 'Admin' || id = @request.auth.id)"
    users.deleteRule = "@request.auth.id != '' && role = 'Admin'"
    app.save(users)

    const categories = new Collection({
      name: 'categories',
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
          collectionId: users.id,
          cascadeDelete: true,
          required: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'color', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(categories)

    const cards = new Collection({
      name: 'cards',
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
          collectionId: users.id,
          cascadeDelete: true,
          required: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'last4', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'limit', type: 'number' },
        { name: 'closingDate', type: 'text' },
        { name: 'dueDate', type: 'text' },
        { name: 'status', type: 'select', values: ['Aberta', 'Fechada', 'Atrasada'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cards)

    const transactions = new Collection({
      name: 'transactions',
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
          collectionId: users.id,
          cascadeDelete: true,
          required: true,
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['income', 'expense'],
          maxSelect: 1,
          required: true,
        },
        { name: 'category', type: 'text' },
        { name: 'origin', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'tags', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(transactions)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('transactions'))
    app.delete(app.findCollectionByNameOrId('cards'))
    app.delete(app.findCollectionByNameOrId('categories'))
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    users.fields.removeByName('situation')
    app.save(users)
  },
)
