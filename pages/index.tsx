import { useState } from 'react';

const IndexPage = () => {
  const [textAreaContent, setTextAreaContent] = useState('');
  const [xmlResponse, setXmlResponse] = useState('');

  async function onSubmit(e, type) {
    e.preventDefault();
    setXmlResponse('');
    const response = await window.fetch(`/api/csv-to-xml?type=${type}`, {
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
      <form>
        <textarea
          cols={100}
          rows={20}
          onChange={(e) => setTextAreaContent(e.target.value)}
        />
        <br />
        <button
          onClick={(e) => {
            onSubmit(e, 'gron');
          }}
        >
          Submit Grön Stöd
        </button>
        <button
          onClick={(e) => {
            onSubmit(e, 'rot');
          }}
        >
          Submit ROT
        </button>
      </form>
    </>
  );
};

export default IndexPage;
