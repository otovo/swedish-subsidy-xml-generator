import { useState } from 'react';

const IndexPage = () => {
  const [textAreaContent, setTextAreaContent] = useState('');
  const [xmlResponse, setXmlResponse] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setXmlResponse('');
    const response = await window.fetch('/api/csv-to-xml', {
      method: 'POST',
      body: textAreaContent,
      headers: {
        'content-type': 'text/plain',
      },
    });
    setTextAreaContent('');
    const text = await response.text();
    setXmlResponse(text);
  }

  return (
    <>
      <pre>{xmlResponse}</pre>
      <h1>Paste your CSV and hit submit</h1>
      <form onSubmit={onSubmit}>
        <textarea
          cols={100}
          rows={20}
          onChange={(e) => setTextAreaContent(e.target.value)}
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default IndexPage;
