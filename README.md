```javascript
$(ARRAY)(
  $(OBJECT)(
    $(KEY)(
      'test',
      $(BOOLEAN)(true),
    ),
  )
)

function jib(renderer, parent, def, _node) {
  let { Type, props, children } = def;
  let node = (_node) ? _node : renderer.createNode(parent, Type, props, children);
}
```