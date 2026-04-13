routerAdd(
  'DELETE',
  '/backend/v1/transactions/clear',
  (e) => {
    if (!e.auth) {
      throw new UnauthorizedError('Authentication required.')
    }

    const records = $app.findRecordsByFilter(
      'transactions',
      "user_id = '" + e.auth.id + "'",
      '',
      100000,
      0,
    )

    $app.runInTransaction((txApp) => {
      for (let i = 0; i < records.length; i++) {
        txApp.delete(records[i])
      }
    })

    return e.json(200, { success: true, count: records.length })
  },
  $apis.requireAuth(),
)
