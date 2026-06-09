import { marked } from 'marked';

const content = `
# 2 건축물의 용도 

<iframe src="occupancy.html?embed=true" style="width: 100%; height: 800px; border: none; background: transparent;"></iframe>

# 3 건축물의 용도변경시 체크사항 
`;

console.log('--- OUTPUT ---');
console.log(marked.parse(content));
console.log('--------------');
