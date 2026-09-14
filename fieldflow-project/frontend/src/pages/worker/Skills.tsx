import { useEffect, useState, type FormEvent } from "react";
import Layout from "../../components/Layout";
import type { User } from "../../types";
import { apiFetch } from "../../api/client";

type Skill = {
  id: number;
  worker: number;
  name: string;
  level: number;
};

type SkillsResponse =
  | Skill[]
  | { results?: Skill[] };

export default function Skills({ user }: { user: User }) {
  const [items, setItems] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("3");
  const [error, setError] = useState("");

  const load = async () => {
    const data = await apiFetch<SkillsResponse>("/services/skills/");
    setItems(Array.isArray(data) ? data : data.results ?? []);
  };

  useEffect(() => {
    load().catch((e) => {
      setError(
        e instanceof Error ? e.message : "Unable to load skills"
      );
      setItems([]);
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await apiFetch("/services/skills/", {
        method: "POST",
        body: JSON.stringify({
          name,
          level: Number(level),
        }),
      });

      setName("");
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save skill"
      );
    }
  };

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKER PROFILE</span>
          <h2>Skills</h2>
          <p>
            Keep your expertise visible for better assignment matching.
          </p>
        </div>
      </div>

      <div className="two-col">
        <form className="panel stack" onSubmit={submit}>
          <h3>Add skill</h3>

          <label>
            Skill name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="AC Repair"
              required
            />
          </label>

          <label>
            Level
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="1">Beginner</option>
              <option value="2">Working</option>
              <option value="3">Strong</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </select>
          </label>

          {error && <div className="error-box">{error}</div>}

          <button className="primary" type="submit">
            Save skill
          </button>
        </form>

        <div className="panel">
          <h3>Your skill set</h3>

          {items.map((skill) => (
            <div className="list-row" key={skill.id}>
              <strong>{skill.name}</strong>
              <span>Level {skill.level}/5</span>
            </div>
          ))}

          {items.length === 0 && (
            <div className="empty">
              Add your first skill.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
