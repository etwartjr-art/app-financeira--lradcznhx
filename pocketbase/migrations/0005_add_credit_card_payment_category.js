migrate(
  (app) => {
    try {
      const categoriesCol = app.findCollectionByNameOrId('categories')
      const users = app.findRecordsByFilter('_pb_users_auth_', '1=1', '', 10000, 0)

      for (const user of users) {
        try {
          app.findFirstRecordByFilter(
            'categories',
            "name = 'PAGAMENTO DE CARTAO' && user_id = {:userId}",
            { userId: user.id },
          )
        } catch (_) {
          const record = new Record(categoriesCol)
          record.set('name', 'PAGAMENTO DE CARTAO')
          record.set('color', '#EF4444')
          record.set('user_id', user.id)
          app.save(record)
        }
      }
    } catch (error) {
      console.log('Erro ao executar migração 0005:', error)
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'categories',
        "name = 'PAGAMENTO DE CARTAO'",
        '',
        10000,
        0,
      )
      for (const record of records) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
