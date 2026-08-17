import { deleteFaq, saveFaq } from "../../actions";
import { Card, Checkbox, Field, Select, SubmitRow, TextArea } from "../../ui";
import type { DbFaq } from "@/server/content/store";

const TOPICS = ["general", "cooling", "heating", "maintenance", "billing"];

export function FaqForm({ faq }: { faq?: DbFaq }) {
  const editing = Boolean(faq);

  return (
    <form action={saveFaq} className="space-y-6">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

      <Card className="space-y-5">
        <TextArea
          label="Question"
          name="question"
          required
          rows={2}
          defaultValue={faq?.question}
          placeholder="Do you charge for a diagnostic visit?"
          hint="Write it the way a customer would ask it."
        />

        <TextArea
          label="Answer"
          name="answer"
          required
          rows={6}
          defaultValue={faq?.answer}
          hint="Give a straight answer. Only state prices, timings or guarantees you will actually honour — this markup can appear directly in Google results."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Select
            label="Topic"
            name="topic"
            defaultValue={faq?.topic}
            options={TOPICS.map((value) => ({ value, label: value }))}
            hint="Groups the question on relevant pages."
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={faq?.sortOrder ?? 0}
          />
          <div className="flex items-end pb-2.5">
            <Checkbox
              label="Published"
              name="published"
              defaultChecked={faq?.published ?? true}
            />
          </div>
        </div>
      </Card>

      <SubmitRow
        cancelHref="/admin/faqs"
        label={editing ? "Save changes" : "Add question"}
      />
    </form>
  );
}

export function DeleteFaqForm({ id }: { id: string }) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-bold text-red-900">Delete this question</p>
      <form action={deleteFaq} className="mt-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Delete question
        </button>
      </form>
    </div>
  );
}
