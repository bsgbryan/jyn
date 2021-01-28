const madul = {
  greet: ({ name }) => `Hello ${name}!`,
  object: () => ({ example: 'response' }),
  fn: () => () => {},
  string: () => 'This is a string, yay!',
  number: () => 42,
  bool: () => false,
  null: () => null,
  undefined: () => {},
  error: () => { throw new Error('Example error message') },
  meta: ({ meta }) => meta
}
