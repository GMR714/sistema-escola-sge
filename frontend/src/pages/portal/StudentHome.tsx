import { useEffect, useState } from 'react';
import { Container, Title, Paper, Text, Grid, Table, RingProgress, Center, Button, Group } from '@mantine/core';
import { useLocation } from 'wouter';
import { api } from '../../api/client';
import { IconLogout } from '@tabler/icons-react';

interface StudentData {
    nome: string;
    turma: string;
    notas: {
        disciplina: string;
        avaliacao: string;
        valor: number;
    }[];
    frequencia: {
        presente: number;
        total: number;
        porcentagem: number;
    };
}

export default function StudentHome() {
    const [data, setData] = useState<StudentData | null>(null);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const stored = localStorage.getItem('student_token');
        if (!stored) {
            setLocation('/portal/login');
            return;
        }
        const user = JSON.parse(stored);

        api.get<StudentData>(`/portal/me?student_id=${user.id}`)
            .then(res => setData(res.data))
            .catch(() => setLocation('/portal/login'));
    }, [setLocation]);

    const handleLogout = () => {
        localStorage.removeItem('student_token');
        setLocation('/portal/login');
    };

    if (!data) return <Text ta="center" mt="xl">Carregando...</Text>;

    return (
        <Container size="lg" py="xl">
            <Paper shadow="xs" p="md" mb="lg" radius="md">
                <Group justify="space-between">
                    <div>
                        <Title order={3}>{data.nome}</Title>
                        <Text c="dimmed">{data.turma || "Sem turma ativa"}</Text>
                    </div>
                    <Button variant="light" color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                        Sair
                    </Button>
                </Group>
            </Paper>

            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="md" radius="md">
                        <Title order={4} mb="md">Minhas Notas</Title>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Disciplina</Table.Th>
                                    <Table.Th>Avaliação</Table.Th>
                                    <Table.Th>Nota</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.notas.map((nota, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{nota.disciplina}</Table.Td>
                                        <Table.Td>{nota.avaliacao}</Table.Td>
                                        <Table.Td>
                                            <Text fw={700} c={nota.valor >= 60 ? 'teal' : 'red'}>
                                                {nota.valor}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                {data.notas.length === 0 && (
                                    <Table.Tr>
                                        <Table.Td colSpan={3} align="center">Nenhuma nota lançada.</Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="md" radius="md">
                        <Title order={4} mb="md">Frequência</Title>
                        <Center>
                            <RingProgress
                                size={160}
                                roundCaps
                                thickness={16}
                                sections={[{ value: data.frequencia.porcentagem, color: data.frequencia.porcentagem >= 75 ? 'teal' : 'red' }]}
                                label={
                                    <Text c="dimmed" fw={700} ta="center" size="xl">
                                        {data.frequencia.porcentagem}%
                                    </Text>
                                }
                            />
                        </Center>
                        <Text ta="center" mt="md" size="sm">
                            {data.frequencia.presente} presenças em {data.frequencia.total} aulas
                        </Text>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
