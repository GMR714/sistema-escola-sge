import { Title, Select, Button, Table, Group, Paper, Modal, TextInput, NumberInput, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconPencil } from '@tabler/icons-react';

interface Turma {
    id: string;
    nome: string;
    ano: number;
}

interface Avaliacao {
    id: number;
    nome: string;
    data: string;
    valor_maximo: number;
}

interface Nota {
    id: number;
    matricula_id: number;
    aluno_nome: string;
    valor: number | null;
}

export default function Grades() {
    const [turmaId, setTurmaId] = useState<string | null>(null);
    const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    // Form states for new evaluation
    const [newEvalName, setNewEvalName] = useState('');
    const [newEvalDate, setNewEvalDate] = useState('');
    const [newEvalMax, setNewEvalMax] = useState<number | string>(10);

    // State for grades editing
    const [notasLocais, setNotasLocais] = useState<Record<number, number>>({});

    // New State for Disciplina selection in Modal
    const [newEvalDisciplinaId, setNewEvalDisciplinaId] = useState<string | null>(null);

    // 1. Fetch Turmas
    const { data: turmas } = useQuery({
        queryKey: ['turmas'],
        queryFn: async () => (await api.get<Turma[]>('/academic/turmas')).data
    });

    // 1.1 Fetch Disciplinas (using pedagogical endpoint for now, ideally filtered by Turma Matriz)
    const { data: disciplinas } = useQuery({
        queryKey: ['disciplinas'],
        queryFn: async () => (await api.get<{ id: number, nome: string }[]>('/pedagogical/disciplinas')).data
    });

    // 2. Fetch Avaliacoes when Turma is selected
    const { data: avaliacoes } = useQuery({
        queryKey: ['avaliacoes', turmaId],
        queryFn: async () => (await api.get<Avaliacao[]>(`/diary/turmas/${turmaId}/avaliacoes`)).data,
        enabled: !!turmaId
    });

    // 3. Fetch Notas when Avaliacao is selected
    const { data: notas } = useQuery({
        queryKey: ['notas', avaliacaoId],
        queryFn: async () => {
            const res = (await api.get<Nota[]>(`/diary/avaliacoes/${avaliacaoId}/notas`)).data;
            // Initialize local state
            const initial: Record<number, number> = {};
            res.forEach(n => {
                if (n.valor !== null) initial[n.matricula_id] = n.valor;
            });
            setNotasLocais(initial);
            return res;
        },
        enabled: !!avaliacaoId
    });

    // Mutations
    const createEvalMutation = useMutation({
        mutationFn: async () => {
            return api.post('/diary/avaliacoes', {
                turma_id: Number(turmaId),
                disciplina_id: newEvalDisciplinaId ? Number(newEvalDisciplinaId) : null,
                nome: newEvalName,
                data: newEvalDate,
                valor_maximo: Number(newEvalMax)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
            close();
            notifications.show({ title: 'Sucesso', message: 'Avaliação criada!', color: 'green' });
        }
    });

    const saveGradesMutation = useMutation({
        mutationFn: async () => {
            const payload = Object.entries(notasLocais).map(([matricula_id, valor]) => ({
                matricula_id: Number(matricula_id),
                valor
            }));
            return api.post(`/diary/avaliacoes/${avaliacaoId}/notas`, { notas: payload });
        },
        onSuccess: () => {
            notifications.show({ title: 'Sucesso', message: 'Notas salvas!', color: 'green' });
        }
    });

    return (
        <>
            <Title order={2} mb="lg">Lançamento de Notas</Title>

            <Paper p="md" mb="lg" withBorder>
                <Group align="flex-end">
                    <Select
                        label="Selecione a Turma"
                        placeholder="Escolha uma turma"
                        data={turmas?.map(t => ({ value: String(t.id), label: `${t.nome} (${t.ano})` })) || []}
                        value={turmaId}
                        onChange={(val) => { setTurmaId(val); setAvaliacaoId(null); }}
                        w={300}
                    />

                    {turmaId && (
                        <Select
                            label="Selecione a Avaliação"
                            placeholder="Escolha uma avaliação"
                            data={avaliacoes?.map(a => ({ value: String(a.id), label: `${a.nome} (Max: ${a.valor_maximo})` })) || []}
                            value={avaliacaoId}
                            onChange={setAvaliacaoId}
                            w={300}
                        />
                    )}

                    {turmaId && (
                        <Button leftSection={<IconPlus size={16} />} onClick={open}>
                            Nova Avaliação
                        </Button>
                    )}
                </Group>
            </Paper>

            {avaliacaoId && (
                <>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Aluno</Table.Th>
                                <Table.Th>Nota</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {notas?.map((nota) => (
                                <Table.Tr key={nota.matricula_id}>
                                    <Table.Td>{nota.aluno_nome}</Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            value={notasLocais[nota.matricula_id] ?? ''}
                                            onChange={(val) => setNotasLocais(prev => ({ ...prev, [nota.matricula_id]: Number(val) }))}
                                            min={0}
                                            max={100}
                                            w={100}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="md">
                        <Button
                            onClick={() => saveGradesMutation.mutate()}
                            loading={saveGradesMutation.isPending}
                        >
                            Salvar Notas
                        </Button>
                    </Group>
                </>
            )}

            <Modal opened={opened} onClose={close} title="Nova Avaliação">
                <Select
                    label="Disciplina"
                    placeholder="Selecione a disciplina"
                    data={disciplinas?.map(d => ({ value: String(d.id), label: d.nome })) || []}
                    value={newEvalDisciplinaId}
                    onChange={setNewEvalDisciplinaId}
                    mb="md"
                    clearable
                />
                <TextInput label="Nome" placeholder="Ex: Prova 1" value={newEvalName} onChange={(e) => setNewEvalName(e.target.value)} mb="md" />
                <TextInput type="date" label="Data" value={newEvalDate} onChange={(e) => setNewEvalDate(e.target.value)} mb="md" />
                <NumberInput label="Valor Máximo" value={newEvalMax} onChange={setNewEvalMax} mb="lg" />
                <Button fullWidth onClick={() => createEvalMutation.mutate()}>Criar</Button>
            </Modal>
        </>
    );
}
