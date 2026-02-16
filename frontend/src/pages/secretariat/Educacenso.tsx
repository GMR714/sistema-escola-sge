import { Button, Group, Title, Text, Card, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconFileSpreadsheet, IconSchool, IconUsers } from '@tabler/icons-react';
import { api } from '../../api/client';

export default function Educacenso() {

    const downloadCsv = async (endpoint: string, filename: string) => {
        try {
            const response = await api.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erro ao baixar arquivo", error);
            alert("Erro ao baixar arquivo.");
        }
    };

    return (
        <>
            <Title order={2} mb="lg">Exportação Educacenso</Title>
            <Text c="dimmed" mb="xl">
                Exporte os dados cadastrais em formato CSV para conferência ou importação.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mt="md" mb="xs">
                        <Group>
                            <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                                <IconSchool style={{ width: '70%', height: '70%' }} />
                            </ThemeIcon>
                            <Text fw={500}>Dados das Escolas</Text>
                        </Group>
                    </Group>

                    <Text size="sm" c="dimmed" mb="lg">
                        Lista completa de escolas com código INEP e endereço.
                    </Text>

                    <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="md"
                        radius="md"
                        leftSection={<IconFileSpreadsheet size={16} />}
                        onClick={() => downloadCsv('/reports/educacenso/escolas', 'escolas_educacenso.csv')}
                    >
                        Baixar CSV
                    </Button>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mt="md" mb="xs">
                        <Group>
                            <ThemeIcon size="xl" radius="md" variant="light" color="green">
                                <IconUsers style={{ width: '70%', height: '70%' }} />
                            </ThemeIcon>
                            <Text fw={500}>Dados dos Alunos</Text>
                        </Group>
                    </Group>

                    <Text size="sm" c="dimmed" mb="lg">
                        Lista de alunos ativos com dados pessoais, NIS e INEP.
                    </Text>

                    <Button
                        variant="light"
                        color="green"
                        fullWidth
                        mt="md"
                        radius="md"
                        leftSection={<IconFileSpreadsheet size={16} />}
                        onClick={() => downloadCsv('/reports/educacenso/alunos', 'alunos_educacenso.csv')}
                    >
                        Baixar CSV
                    </Button>
                </Card>
            </SimpleGrid>
        </>
    );
}
