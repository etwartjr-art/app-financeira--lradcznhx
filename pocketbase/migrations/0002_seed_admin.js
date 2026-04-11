migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    try {
      app.findAuthRecordByEmail('users', 'financeiro@etw-art-contabilidade.com.br')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('financeiro@etw-art-contabilidade.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    record.set('role', 'Admin')
    record.set('situation', 'Ativo')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'financeiro@etw-art-contabilidade.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
