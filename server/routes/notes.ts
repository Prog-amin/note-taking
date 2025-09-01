import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
    return res.json({ ok: true, notes });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
});

const createSchema = z.object({ content: z.string().min(1).max(1000) });

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid content" });
  try {
    const note = await prisma.note.create({ data: { userId: req.user!.id, content: parse.data.content } });
    return res.json({ ok: true, note });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create note" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) return res.status(404).json({ error: "Note not found" });
    await prisma.note.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
