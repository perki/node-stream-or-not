# Investigating Streaming with Node.js 

While optimizing a backend API distributing data I was intensively using streams to pass data through different stages to transform it and to serialize it. 

I faced some limitation with streams. 

With this code I would like to investigate when and how it's wise to use Node.js streaming.

## Plan 

### A- Created multiple sources of data 

- [] MongoDB - raw cursors - Use cursor.hasNext() and cursor.next() 
- [] MongoDB - paginated - Use query.limit().skip().toArray() 
- [] MongoDB - built-in stream - Use cusor.stream()    