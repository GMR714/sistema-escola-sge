import { Title, Select, Button, Table, Checkbox, Group, Paper } from '@mantine/core';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { notifications } from '@mantine/notifications';

interface Turma {
    id: string; // Select value is string
    nome: string;
    ano: number;
    turno: string;
}

interface AlunoMatricula {
    id: number; // matricula id
    aluno_id: number;
    nome: string;
}

export default function Diary() {
    const [turmaId, setTurmaId] = useState<string | null>(null);
    const [presencas, setPresencas] = useState<Record<number, boolean>>({});

    const { data: turmas } = useQuery({
        queryKey: ['turmas'],
        queryFn: async () => {
            const res = await api.get<Turma[]>('/academic/turmas');
            return res.data;
        }
    });

    const { data: alunos, isFetching } = useQuery({
        queryKey: ['alunos', turmaId],
        queryFn: async () => {
            if (!turmaId) return [];
            const res = await api.get<AlunoMatricula[]>(`/academic/turmas/${turmaId}/alunos`);
            // Initialize presence to true
            const initialPresencas: Record<number, boolean> = {};
            res.data.forEach(a => initialPresencas[a.id] = true);
            setPresencas(initialPresencas);
            return res.data;
        },
        enabled: !!turmaId
    });

    const handlePresencaChange = (matriculaId: number, checked: boolean) => {
        setPresencas(prev => ({ ...prev, [matriculaId]: checked }));
    };

    const handleSubmit = () => {
        // Here we would call API to save attendance
        console.log("Saving attendance:", { turmaId, presencas });
        notifications.show({
            title: 'Sucesso',
            message: 'Chamada realizada com sucesso (Simulação)',
            color: 'green'
        });
    };

    return (
        <>
            <Title order={2} mb="lg">Diário de Classe</Title>

            <Paper p="md" mb="lg" withBorder>
                <Select
                    label="Selecione a Turma"
                    placeholder="Escolha uma turma"
                    data={turmas?.map(t => ({ value: String(t.id), label: `${t.nome} (${t.ano})` })) || []}
                    value={turmaId}
                    onChange={setTurmaId}
                />
            </Paper>

            {turmaId && (
                <>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Matrícula ID</Table.Th>
                                <Table.Th>Aluno</Table.Th>
                                <Table.Th>Presença</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {alunos?.map((aluno) => (
                                <Table.Tr key={aluno.id}>
                                    <Table.Td>{aluno.id}</Table.Td>
                                    <Table.Td>{aluno.nome}</Table.Td>
                                    <Table.Td>
                                        <Checkbox
                                            checked={presencas[aluno.id] ?? true}
                                            onChange={(e) => handlePresencaChange(aluno.id, e.currentTarget.checked)}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="md">
                        <Button onClick={handleSubmit} loading={isFetching}>Salvar Chamada</Button>
                    </Group>
                </>
            )}
        </>
    );
}
